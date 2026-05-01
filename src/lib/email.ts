import { createServerFn } from "@tanstack/react-start";

export const sendEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; html: string }) => input)
  .handler(async ({ data: { to, subject, html } }) => {
    try {
      // .trim() is critical — trailing whitespace in .env causes 403 Forbidden
      const apiKey = (process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY)?.trim();

      if (!apiKey) {
        console.warn("RESEND_API_KEY is not defined on the server. Skipping email.");
        return { success: false, error: "API key missing" };
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "SoulSync <soulsyncsoul@gmail.com>",
          to,
          subject,
          html,
        }),
      });

      const responseData = await response.text();

      if (!response.ok) {
        console.error(
          `[Resend] Failed sending to ${to} — HTTP ${response.status}:`,
          responseData
        );
        // 403 usually means:
        // 1. Invalid/expired API key
        // 2. Sending to an email that isn't the Resend account owner
        //    (onboarding@resend.dev is test-only; verify a domain to send to anyone)
        return { success: false, error: `HTTP ${response.status}: ${responseData}` };
      }

      console.log(`[Resend] Email sent successfully to ${to}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[Resend] Exception sending to ${to}:`, error);
      return { success: false, error: error?.message || "Unknown error" };
    }
  });

