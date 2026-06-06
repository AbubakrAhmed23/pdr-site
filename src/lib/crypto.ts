import crypto from "node:crypto";

// ENCRYPTION_KEY'den 32 baytlık anahtar türetir (uzunluk ne olursa olsun güvenli).
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY ?? "dev-insecure-key")
  .digest();

const ALGO = "aes-256-gcm";

/** Düz metni şifreler → base64(iv | tag | ciphertext). KVKK hassas verileri için. */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/** encrypt() çıktısını çözer. */
export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function encryptJSON(value: unknown): string {
  return encrypt(JSON.stringify(value));
}

export function decryptJSON<T>(payload: string): T {
  return JSON.parse(decrypt(payload)) as T;
}
