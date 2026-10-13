import { randomInt } from "crypto"

/**
 * Small, pure helpers for the public sign-up endpoints, so the rules that
 * protect them can be tested without a server.
 */

// No 0/O/1/I/L: these codes are typed by people from an email or a screenshot.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

/**
 * An activation code that cannot be predicted.
 *
 * It used to come from Math.random(), which is neither unpredictable nor
 * wide: 6 characters of base 36 is about 2 billion possibilities, and the
 * redeem endpoint accepts guesses from anyone. Eight characters drawn from a
 * cryptographic generator over a 31-symbol alphabet is ~850 billion, and
 * knowing earlier codes tells an attacker nothing about the next one.
 */
export function generateActivationCode(prefix: string): string {
  let body = ""
  for (let i = 0; i < 8; i++) body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return `${prefix}-${body}`
}

/** Lowercase and trim. Without it "Ana@x.com" and "ana@x.com" count as two people. */
export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false
  return /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]{2,}$/.test(email)
}

/** Trim, collapse whitespace, cap the length. The name ends up in an outgoing email. */
export function cleanAcademyName(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim().slice(0, 80)
}
