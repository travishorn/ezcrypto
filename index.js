import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";

const algorithm = "aes-256-ctr";

const createKey = (buf) => {
  return createHash("sha256").update(String(buf)).digest("base64").slice(0, 32);
};

export const encrypt = (plaintext, secret) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, createKey(secret), iv);
  const content = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    algorithm,
    iv: iv.toString("base64"),
    content: content.toString("base64"),
  };
};

export const decrypt = (encrypted, secret) => {
  const decipher = createDecipheriv(
    encrypted.algorithm,
    createKey(secret),
    Buffer.from(encrypted.iv, "base64")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString();
};
