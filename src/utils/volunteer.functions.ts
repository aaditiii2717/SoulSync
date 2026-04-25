import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ALLOWED_ADMIN_EMAILS, isAllowedAdminEmail, normalizeEmail } from "@/lib/admin-governance";
import {
  VOLUNTEER_CV_ALLOWED_MIME_TYPES,
  VOLUNTEER_CV_BUCKET,
  VOLUNTEER_CV_MAX_BYTES,
  buildVolunteerCvStoragePath,
  resolveVolunteerCvOpenTarget,
} from "@/lib/volunteer-cv";

const volunteerApplicationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Please enter a valid email address").transform(normalizeEmail),
  expertise: z.array(z.string().trim().min(1)).min(1, "Please select at least one area of expertise"),
  languages: z.array(z.string().trim().min(1)).min(1, "Please select at least one language"),
});

function isMissingCvStoragePathColumnError(message?: string | null) {
  if (!message) return false;

  return (
    message.includes("cv_storage_path") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  );
}

function parseStringList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseVolunteerApplication(formData: FormData) {
  const parsed = volunteerApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    expertise: parseStringList(formData.get("expertise")),
    languages: parseStringList(formData.get("languages")),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Volunteer application is invalid.");
  }

  return parsed.data;
}

function assertCvFile(file: FormDataEntryValue | null) {
  if (!(file instanceof File)) {
    throw new Error("Please upload your CV or certificate.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded CV file is empty.");
  }

  if (file.size > VOLUNTEER_CV_MAX_BYTES) {
    throw new Error("The uploaded CV must be 5 MB or smaller.");
  }

  if (file.type && !VOLUNTEER_CV_ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Please upload a PDF or Word document for the CV.");
  }

  return file;
}

function getAdminEmailFromClaims(claims: Record<string, unknown>) {
  const email = typeof claims.email === "string" ? claims.email : null;
  return email ? normalizeEmail(email) : null;
}

function assertAdminEmail(email: string | null) {
  if (!email || !isAllowedAdminEmail(email)) {
    throw new Error("Unauthorized admin access.");
  }

  return email;
}

export const submitVolunteerApplication = createServerFn({ method: "POST" })
  .inputValidator((input: FormData) => input)
  .handler(async ({ data }) => {
    const application = parseVolunteerApplication(data);
    const cvFile = assertCvFile(data.get("cv"));
    const volunteerId = crypto.randomUUID();
    const storagePath = buildVolunteerCvStoragePath(volunteerId, cvFile.name);

    const { data: existingVolunteer, error: existingVolunteerError } = await supabaseAdmin
      .from("volunteers")
      .select("id")
      .eq("email", application.email)
      .maybeSingle();

    if (existingVolunteerError) {
      throw new Error("We could not validate the volunteer email. Please try again.");
    }

    if (existingVolunteer) {
      throw new Error("This email is already registered as a volunteer.");
    }

    const fileBytes = Buffer.from(await cvFile.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from(VOLUNTEER_CV_BUCKET)
      .upload(storagePath, fileBytes, {
        cacheControl: "3600",
        contentType: cvFile.type || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`CV upload failed: ${uploadError.message}`);
    }

    const baseVolunteerInsert = {
      id: volunteerId,
      name: application.name,
      email: application.email,
      expertise: application.expertise,
      languages: application.languages,
      bio: null,
      cv_url: storagePath,
      verification_status: "pending",
      is_verified: false,
      is_active: false,
      is_admin: false,
    };

    let insertError: { message: string } | null = null;

    const { error: insertWithPathError } = await supabaseAdmin.from("volunteers").insert({
      ...baseVolunteerInsert,
      cv_storage_path: storagePath,
    });

    if (insertWithPathError) {
      if (isMissingCvStoragePathColumnError(insertWithPathError.message)) {
        const { error: insertLegacyError } = await supabaseAdmin.from("volunteers").insert(baseVolunteerInsert);
        insertError = insertLegacyError;
      } else {
        insertError = insertWithPathError;
      }
    }

    if (insertError) {
      await supabaseAdmin.storage.from(VOLUNTEER_CV_BUCKET).remove([storagePath]);
      throw new Error(insertError.message);
    }

    return {
      volunteerId,
      email: application.email,
    };
  });

export const ensureAdminVolunteerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const adminEmail = assertAdminEmail(getAdminEmailFromClaims(context.claims as Record<string, unknown>));
    const fallbackName = adminEmail.split("@")[0];

    const { data, error } = await supabaseAdmin
      .from("volunteers")
      .upsert(
        {
          email: adminEmail,
          name: fallbackName,
          is_admin: true,
          is_active: true,
          is_verified: true,
          verification_status: "verified",
        },
        { onConflict: "email" },
      )
      .select("id, email, name, is_admin, is_active, is_verified, verification_status")
      .single();

    if (error) {
      throw new Error("Failed to provision the admin profile.");
    }

    return data;
  });

export const setVolunteerVerificationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { volunteerId: string; status: "verified" | "rejected" }) => input,
  )
  .handler(async ({ context, data }) => {
    assertAdminEmail(getAdminEmailFromClaims(context.claims as Record<string, unknown>));

    const updates =
      data.status === "verified"
        ? {
            verification_status: "verified",
            is_verified: true,
            is_active: true,
            is_deactivated: false,
          }
        : {
            verification_status: "rejected",
            is_verified: false,
            is_active: false,
          };

    const { data: volunteer, error } = await supabaseAdmin
      .from("volunteers")
      .update(updates)
      .eq("id", data.volunteerId)
      .select("id, email, name, verification_status, is_verified, is_active")
      .single();

    if (error) {
      throw new Error("Governance action failed.");
    }

    return volunteer;
  });

export const getVolunteerCvAccessUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { volunteerId: string }) => input)
  .handler(async ({ context, data }) => {
    assertAdminEmail(getAdminEmailFromClaims(context.claims as Record<string, unknown>));

    const primaryVolunteerQuery = await supabaseAdmin
      .from("volunteers")
      .select("cv_url, cv_storage_path")
      .eq("id", data.volunteerId)
      .single();

    let volunteer = primaryVolunteerQuery.data;
    let volunteerError = primaryVolunteerQuery.error;

    if (volunteerError && isMissingCvStoragePathColumnError(volunteerError.message)) {
      const legacyVolunteerQuery = await supabaseAdmin
        .from("volunteers")
        .select("cv_url")
        .eq("id", data.volunteerId)
        .single();

      volunteer = legacyVolunteerQuery.data;
      volunteerError = legacyVolunteerQuery.error;
    }

    if (volunteerError || !volunteer) {
      throw new Error("Volunteer CV could not be found.");
    }

    const cvTarget = resolveVolunteerCvOpenTarget(volunteer);
    if (!cvTarget) {
      throw new Error("This volunteer has not uploaded a CV yet.");
    }

    if (cvTarget.kind === "external") {
      return { url: cvTarget.value };
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(VOLUNTEER_CV_BUCKET)
      .createSignedUrl(cvTarget.value, 60 * 10, { download: false });

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error("Could not open CV. It may be missing or inaccessible.");
    }

    return { url: signedUrlData.signedUrl };
  });

export { ALLOWED_ADMIN_EMAILS };
