export const ALIAS_STORAGE_KEY = "soulSync_alias_id";
export const RECOVERY_USERNAME_STORAGE_KEY = "soulSync_recovery_username";
export const RECOVERY_PLAIN_KEY_STORAGE_KEY = "soulSync_recovery_key";
export const SOULSYNC_IDENTITY_EVENT = "soulsync-identity-changed";

const anonymousAnimals = ["Panda", "Koala", "Fox", "Otter", "Dolphin", "Crane"];
const usernameAdjectives = [
  "sleepy",
  "fluffy",
  "grumpy",
  "sunny",
  "dreamy",
  "gentle",
  "sparkly",
  "bouncy",
  "cozy",
  "snuggly",
  "curious",
  "mellow",
];
const usernameNouns = [
  "mango",
  "phoenix",
  "waffle",
  "otter",
  "noodle",
  "mochi",
  "cookie",
  "panda",
  "latte",
  "pebble",
  "berry",
  "cloud",
];

export function createAnonymousAliasName() {
  const animal = anonymousAnimals[Math.floor(Math.random() * anonymousAnimals.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${animal}-${number}`;
}

export function normalizeRecoveryUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function generateUsernameSuggestions(count = 4) {
  const suggestions = new Set<string>();

  while (suggestions.size < count) {
    const adjective = usernameAdjectives[Math.floor(Math.random() * usernameAdjectives.length)];
    const noun = usernameNouns[Math.floor(Math.random() * usernameNouns.length)];
    const number = Math.floor(7 + Math.random() * 90);
    suggestions.add(`${adjective}-${noun}-${number}`);
  }

  return Array.from(suggestions);
}

export async function hashRecoveryKey(recoveryKey: string) {
  const encoded = new TextEncoder().encode(recoveryKey);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function getRecoveryKeyStrength(recoveryKey: string) {
  let score = 0;

  if (recoveryKey.length >= 8) score += 1;
  if (recoveryKey.length >= 12) score += 1;
  if (/[A-Z]/.test(recoveryKey) && /[a-z]/.test(recoveryKey)) score += 1;
  if (/\d/.test(recoveryKey)) score += 1;
  if (/[^A-Za-z0-9]/.test(recoveryKey)) score += 1;

  if (score >= 4) {
    return { label: "strong" as const, value: 100 };
  }

  if (score >= 2) {
    return { label: "okay" as const, value: 66 };
  }

  return { label: "weak" as const, value: 33 };
}

export function dispatchIdentityChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SOULSYNC_IDENTITY_EVENT));
}

export function downloadRecoveryFile(username: string, recoveryKey: string) {
  const fileContents = `Soul Sync Recovery File
------------------------
Username: ${username}
Recovery Key: ${recoveryKey}

Keep this safe. Do not share it with anyone.
We cannot recover this for you.
`;

  const blob = new Blob([fileContents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "soul-sync-recovery.txt";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function storeRecoveryIdentityLocally(options: {
  aliasId?: string;
  username: string;
  recoveryKey: string;
}) {
  if (typeof window === "undefined") return;

  if (options.aliasId) {
    localStorage.setItem(ALIAS_STORAGE_KEY, options.aliasId);
  }

  localStorage.setItem(RECOVERY_USERNAME_STORAGE_KEY, options.username);
  localStorage.setItem(RECOVERY_PLAIN_KEY_STORAGE_KEY, options.recoveryKey);
  dispatchIdentityChanged();
}

export function clearRecoveryIdentityLocally() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(RECOVERY_USERNAME_STORAGE_KEY);
  localStorage.removeItem(RECOVERY_PLAIN_KEY_STORAGE_KEY);
  dispatchIdentityChanged();
}
