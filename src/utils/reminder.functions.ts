import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------------------------------------------------------------------------
// Startup warning: ensure CRON_SECRET is configured in production
// ---------------------------------------------------------------------------
if (typeof process !== "undefined") {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && (!secret || secret === "soulsync-cron-secret-change-me")) {
    console.warn(
      "\n⚠️  [SECURITY] CRON_SECRET is missing or still set to the default placeholder.\n" +
      "   The /api/cron-reminders endpoint is NOT secure.\n" +
      "   Set a strong CRON_SECRET in your environment variables before deploying.\n"
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a date string like "Sat, Apr 26, 2026" */
function formatDateNice(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}

/** Format a time string like "10:30:00" → "10:30 AM" */
function formatTimeNice(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

/**
 * Send an email via the Resend API.
 * This is a direct server-side call (same pattern as src/lib/email.ts)
 * but without the createServerFn wrapper since we're already on the server.
 */
async function sendReminderEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)?.trim();

  if (!apiKey) {
    console.warn("[Reminder] RESEND_API_KEY is not defined. Skipping email.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "SoulSync <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Reminder] Resend API error for ${to} — HTTP ${response.status}: ${body}`);
      return false;
    }

    console.log(`[Reminder] Email sent successfully to ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[Reminder] Exception sending to ${to}:`, err?.message || err);
    return false;
  }
}

/** Build the reminder email HTML body */
function buildReminderHtml(opts: {
  volunteerName: string;
  studentName: string;
  dateFormatted: string;
  timeFormatted: string;
  meetingToken: string | null;
  bookingId: string;
}): string {
  const dashboardUrl = `${process.env.VITE_SUPABASE_URL ? "https://soulsync.app" : "http://localhost:8080"}/volunteer/dashboard`;
  const meetLink = opts.meetingToken
    ? `https://meet.jit.si/SoulSync-Session-${opts.bookingId}`
    : null;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          🔔 Session Reminder
        </div>
      </div>

      <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; text-align: center;">
        Your session starts in 30 minutes
      </h2>

      <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0 0 24px;">
        Hi <strong>${opts.volunteerName}</strong>, here are the details:
      </p>

      <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <table style="width: 100%; font-size: 14px; color: #334155;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8; width: 100px;">Student</td>
            <td style="padding: 8px 0; font-weight: 700;">${opts.studentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Date</td>
            <td style="padding: 8px 0;">${opts.dateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Time</td>
            <td style="padding: 8px 0;">${opts.timeFormatted}</td>
          </tr>
        </table>
      </div>

      ${meetLink ? `
      <a href="${meetLink}" target="_blank" style="display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 12px;">
        🎥 Join Meeting Room
      </a>
      ` : `
      <div style="text-align: center; background: #f1f5f9; color: #64748b; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; margin-bottom: 12px; border: 1px dashed #cbd5e1;">
        The meeting link will be shared shortly
      </div>
      `}

      <a href="${dashboardUrl}" target="_blank" style="display: block; text-align: center; background: white; color: #6366f1; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 13px; border: 1px solid #e2e8f0;">
        Open Volunteer Dashboard →
      </a>

      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
        Sent by SoulSync · Peer Support Platform
      </p>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Main server function: process all due reminders
// ---------------------------------------------------------------------------

export const processSessionReminders = createServerFn({ method: "POST" })
  .handler(async () => {
    let sent = 0;
    let errors = 0;

    try {
      // Query sessions due for a reminder using the Postgres RPC.
      // This strictly uses the database's timezone-aware intervals
      // to find sessions starting within the next 31 minutes.
      const { data: bookings, error: queryError } = await supabaseAdmin
        .rpc("get_due_session_reminders");

      if (queryError) {
        console.error("[Reminder] Query error:", queryError.message);
        return { sent: 0, errors: 1 };
      }

      if (!bookings || bookings.length === 0) {
        return { sent: 0, errors: 0 };
      }

      for (const booking of bookings) {
        if (!booking.volunteer_email) {
          console.warn(`[Reminder] No volunteer email for booking ${booking.booking_id}, skipping.`);
          continue;
        }

        const emailHtml = buildReminderHtml({
          volunteerName: booking.volunteer_name || "Volunteer",
          studentName: booking.anonymous_name || "Anonymous",
          dateFormatted: formatDateNice(booking.slot_date),
          timeFormatted: formatTimeNice(booking.start_time) + " IST",
          meetingToken: booking.meeting_token,
          bookingId: booking.booking_id,
        });

        const success = await sendReminderEmail(
          booking.volunteer_email,
          "Reminder: Your SoulSync session starts in 30 minutes",
          emailHtml
        );

        if (success) {
          // Mark as sent ONLY after confirmed delivery
          const { error: updateError } = await supabaseAdmin
            .from("session_bookings")
            .update({ reminder_sent: true })
            .eq("id", booking.booking_id);

          if (updateError) {
            console.error(`[Reminder] Failed to mark reminder_sent for ${booking.booking_id}:`, updateError.message);
            errors++;
          } else {
            sent++;
            console.log(`[Reminder] ✓ Reminder sent for booking ${booking.booking_id} → ${booking.volunteer_email}`);
          }
        } else {
          errors++;
          // Leave reminder_sent = false so it retries on the next run
          console.warn(`[Reminder] ✗ Email failed for booking ${booking.booking_id}, will retry next run.`);
        }
      }
    } catch (err: any) {
      console.error("[Reminder] Unexpected error:", err?.message || err);
      errors++;
    }

    console.log(`[Reminder] Run complete: ${sent} sent, ${errors} errors.`);
    return { sent, errors };
  });
