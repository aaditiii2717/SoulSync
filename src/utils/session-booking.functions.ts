import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface BookingInput {
  timeSlotId: string;
  anonymousName?: string;
  issueType: string;
  notes?: string;
  languagePreference?: string;
}

interface BookingRow {
  id: string;
  anonymous_name: string;
  issue_type: string;
  notes: string | null;
  language_preference: string;
  time_slot: {
    slot_date: string;
    start_time: string;
    end_time: string;
    volunteer: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface ResendSendEmailResponse {
  id?: string;
  message?: string;
  name?: string;
}

function normalizeBookingInput(input: BookingInput) {
  const anonymousName = input.anonymousName?.trim() || "Anonymous";
  const issueType = input.issueType.trim();
  const notes = input.notes?.trim() || null;
  const languagePreference = input.languagePreference?.trim() || "English";

  if (!input.timeSlotId?.trim()) {
    throw new Error("Select a time slot before booking.");
  }

  if (!issueType) {
    throw new Error("Select a support topic before booking.");
  }

  return {
    timeSlotId: input.timeSlotId.trim(),
    anonymousName,
    issueType,
    notes,
    languagePreference,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSlotDate(slotDate: string) {
  return format(new Date(`${slotDate}T00:00:00`), "EEEE, MMMM d, yyyy");
}

function formatSlotTime(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function buildVolunteerBookingEmail(details: {
  volunteerName: string;
  anonymousName: string;
  issueType: string;
  slotDate: string;
  startTime: string;
  endTime: string;
}) {
  const formattedDate = formatSlotDate(details.slotDate);
  const formattedTime = formatSlotTime(details.startTime, details.endTime);
  const volunteerName = escapeHtml(details.volunteerName);
  const anonymousName = escapeHtml(details.anonymousName);
  const issueType = escapeHtml(details.issueType);

  return {
    subject: `New support session booked for ${formattedDate}`,
    text: [
      `Hi ${details.volunteerName},`,
      "",
      "A new anonymous support session has been booked on SoulSync.",
      "",
      `Student display name: ${details.anonymousName}`,
      `Topic: ${details.issueType}`,
      `Date: ${formattedDate}`,
      `Time: ${formattedTime}`,
      "",
      "Please be ready in the app a few minutes before the session starts.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${volunteerName},</p>
        <p>A new anonymous support session has been booked on SoulSync.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600;">Student display name</td>
            <td style="padding: 6px 0;">${anonymousName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600;">Topic</td>
            <td style="padding: 6px 0;">${issueType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600;">Date</td>
            <td style="padding: 6px 0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; font-weight: 600;">Time</td>
            <td style="padding: 6px 0;">${formattedTime}</td>
          </tr>
        </table>
        <p>Please be ready in the app a few minutes before the session starts.</p>
      </div>
    `.trim(),
  };
}

async function updateVolunteerNotificationStatus(
  bookingId: string,
  status: "sent" | "failed" | "skipped",
  errorMessage?: string,
) {
  const payload =
    status === "sent"
      ? {
          volunteer_notification_status: status,
          volunteer_notification_sent_at: new Date().toISOString(),
          volunteer_notification_last_error: null,
        }
      : {
          volunteer_notification_status: status,
          volunteer_notification_sent_at: null,
          volunteer_notification_last_error: errorMessage ?? null,
        };

  const { error } = await supabaseAdmin
    .from("session_bookings")
    .update(payload)
    .eq("id", bookingId);

  if (error) {
    console.error("Failed to update volunteer notification status:", error.message);
  }
}

async function sendVolunteerBookingEmail({
  bookingId,
  volunteerEmail,
  volunteerName,
  anonymousName,
  issueType,
  slotDate,
  startTime,
  endTime,
}: {
  bookingId: string;
  volunteerEmail: string;
  volunteerName: string;
  anonymousName: string;
  issueType: string;
  slotDate: string;
  startTime: string;
  endTime: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const bookingEmailFrom = process.env.BOOKING_EMAIL_FROM;
  const bookingEmailReplyTo = process.env.BOOKING_EMAIL_REPLY_TO;

  if (!resendApiKey || !bookingEmailFrom) {
    await updateVolunteerNotificationStatus(
      bookingId,
      "skipped",
      "Volunteer booking email skipped because RESEND_API_KEY or BOOKING_EMAIL_FROM is missing.",
    );

    return {
      status: "skipped" as const,
      warning:
        "Booking confirmed, but volunteer email notifications are not configured yet. Set RESEND_API_KEY and BOOKING_EMAIL_FROM on the server.",
    };
  }

  const email = buildVolunteerBookingEmail({
    volunteerName,
    anonymousName,
    issueType,
    slotDate,
    startTime,
    endTime,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
      "Idempotency-Key": `booking-${bookingId}-volunteer-notification`,
    },
    body: JSON.stringify({
      from: bookingEmailFrom,
      to: [volunteerEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(bookingEmailReplyTo ? { reply_to: bookingEmailReplyTo } : {}),
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send volunteer booking email.";

    try {
      const errorBody = (await response.json()) as ResendSendEmailResponse;
      errorMessage = errorBody.message || errorBody.name || errorMessage;
    } catch {
      // Ignore JSON parse failures and fall back to the default message.
    }

    await updateVolunteerNotificationStatus(bookingId, "failed", errorMessage);
    return {
      status: "failed" as const,
      warning: `Booking confirmed, but the volunteer email could not be sent: ${errorMessage}`,
    };
  }

  await updateVolunteerNotificationStatus(bookingId, "sent");
  return { status: "sent" as const, warning: null };
}

export const bookPeerSupportSession = createServerFn({ method: "POST" })
  .inputValidator((input: BookingInput) => input)
  .handler(async ({ data }) => {
    const booking = normalizeBookingInput(data);

    const { data: insertedBooking, error } = await supabaseAdmin
      .from("session_bookings")
      .insert({
        time_slot_id: booking.timeSlotId,
        anonymous_name: booking.anonymousName,
        issue_type: booking.issueType,
        notes: booking.notes,
        language_preference: booking.languagePreference,
      })
      .select(`
        id,
        anonymous_name,
        issue_type,
        notes,
        language_preference,
        time_slot:time_slots!inner(
          slot_date,
          start_time,
          end_time,
          volunteer:volunteers!inner(
            id,
            name,
            email
          )
        )
      `)
      .single();

    if (error) {
      if (
        error.message.includes("This time slot is no longer available.") ||
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new Error("This slot was just booked by someone else. Please choose another one.");
      }

      throw new Error(error.message);
    }

    const bookingRow = insertedBooking as BookingRow;
    const emailResult = await sendVolunteerBookingEmail({
      bookingId: bookingRow.id,
      volunteerEmail: bookingRow.time_slot.volunteer.email,
      volunteerName: bookingRow.time_slot.volunteer.name,
      anonymousName: bookingRow.anonymous_name,
      issueType: bookingRow.issue_type,
      slotDate: bookingRow.time_slot.slot_date,
      startTime: bookingRow.time_slot.start_time,
      endTime: bookingRow.time_slot.end_time,
    });

    return {
      bookingId: bookingRow.id,
      anonymousName: bookingRow.anonymous_name,
      issueType: bookingRow.issue_type,
      slotDate: bookingRow.time_slot.slot_date,
      startTime: bookingRow.time_slot.start_time,
      endTime: bookingRow.time_slot.end_time,
      volunteerId: bookingRow.time_slot.volunteer.id,
      volunteerName: bookingRow.time_slot.volunteer.name,
      volunteerNotificationStatus: emailResult.status,
      volunteerNotificationWarning: emailResult.warning,
    };
  });
