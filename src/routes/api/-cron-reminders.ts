// @ts-expect-error - API routes are available in latest start plugin but TS may not resolve it here
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { processSessionReminders } from "@/utils/reminder.functions";

// ---------------------------------------------------------------------------
// GET /api/cron-reminders?secret=<CRON_SECRET>
//
// Secured endpoint to be called by an external cron service every 5 minutes.
// Cron schedule expression: */5 * * * *
// ---------------------------------------------------------------------------

export const APIRoute = createAPIFileRoute("/api/cron-reminders")({
  GET: async ({ request }: { request: Request }) => {
    try {
      // --- Auth: validate the cron secret ---
      const url = new URL(request.url);
      const providedSecret = url.searchParams.get("secret");
      const expectedSecret = process.env.CRON_SECRET;

      if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
        return new Response(
          JSON.stringify({ ok: false, error: "Forbidden: invalid or missing secret" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // --- Run the reminder processor ---
      const result = await processSessionReminders();

      return new Response(
        JSON.stringify({ ok: true, sent: result.sent, errors: result.errors }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      console.error("[cron-reminders] Unexpected error:", err?.message || err);
      return new Response(
        JSON.stringify({ ok: false, error: err?.message || "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
