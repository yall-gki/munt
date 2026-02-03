import crypto from "crypto";

export function generateOtp(length = 6) {
  const max = 10 ** length;
  const value = crypto.randomInt(0, max);
  return value.toString().padStart(length, "0");
}

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
