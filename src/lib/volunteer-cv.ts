export const VOLUNTEER_CV_BUCKET = "volunteers-cvs";
export const VOLUNTEER_CV_MAX_BYTES = 5 * 1024 * 1024;
export const VOLUNTEER_CV_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const STORAGE_PUBLIC_SEGMENT = `/storage/v1/object/public/${VOLUNTEER_CV_BUCKET}/`;
const STORAGE_SIGNED_SEGMENT = `/storage/v1/object/sign/${VOLUNTEER_CV_BUCKET}/`;

export interface VolunteerCvRecord {
  cv_storage_path?: string | null;
  cv_url?: string | null;
}

function stripQueryString(value: string) {
  return value.split("?")[0]?.split("#")[0] ?? value;
}

function sanitizeExtension(fileName: string) {
  const rawExtension = fileName.split(".").pop()?.toLowerCase() ?? "pdf";
  return rawExtension.replace(/[^a-z0-9]/g, "") || "pdf";
}

export function buildVolunteerCvStoragePath(volunteerId: string, fileName: string) {
  const extension = sanitizeExtension(fileName);
  return `applications/${volunteerId}/cv.${extension}`;
}

export function hasVolunteerCv(record: VolunteerCvRecord) {
  return Boolean(extractVolunteerCvStoragePath(record) || record.cv_url);
}

export function extractVolunteerCvStoragePath(record: VolunteerCvRecord) {
  const candidate = record.cv_storage_path?.trim() || record.cv_url?.trim() || "";

  if (!candidate) return null;

  if (candidate.includes(STORAGE_PUBLIC_SEGMENT)) {
    return stripQueryString(candidate.split(STORAGE_PUBLIC_SEGMENT)[1] ?? "");
  }

  if (candidate.includes(STORAGE_SIGNED_SEGMENT)) {
    return stripQueryString(candidate.split(STORAGE_SIGNED_SEGMENT)[1] ?? "");
  }

  if (/^https?:\/\//i.test(candidate)) {
    return null;
  }

  return stripQueryString(candidate);
}

export function resolveVolunteerCvOpenTarget(record: VolunteerCvRecord) {
  const storagePath = extractVolunteerCvStoragePath(record);
  if (storagePath) {
    return { kind: "storage" as const, value: storagePath };
  }

  const candidate = record.cv_url?.trim() || "";
  if (/^https?:\/\//i.test(candidate)) {
    return { kind: "external" as const, value: candidate };
  }

  return null;
}
