export const ALLOWED_ADMIN_EMAILS = [
  "varadprabhu2442@gmail.com",
  "aniket.aniket07sah@gmail.com",
  "aaditishrivastava17@gmail.com",
  "aaditishrivastava@gmail.com",
  "stss@gmail.com",
];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(email));
}
