import { createServerFn } from "@tanstack/react-start";

export const sendEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { to: string; subject: string; html: string }) => input)
  .handler(async ({ data: { to, subject, html } }) => {
    try {
      const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
      
      if (!apiKey) {
        console.warn("RESEND_API_KEY is not defined on the server. Skipping email sending.");
        return { success: false, error: "API key missing" };
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "SoulSync <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to send email to", to, "Error:", errorData);
        return { success: false, error: errorData };
      }
      
      console.log("Email sent successfully to", to);
      return { success: true };
    } catch (error: any) {
      console.error("Error sending email to", to, ":", error);
      return { success: false, error: error?.message || "Unknown error" };
    }
  });
