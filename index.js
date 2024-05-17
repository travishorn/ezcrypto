import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import Ajv from "ajv";

const ajv = new Ajv();

function validateArguments(args, schema) {
  const validate = ajv.compile(schema);
  if (!validate(args)) throw validate.errors;
}

export function encrypt(plaintext, key) {
  validateArguments(
    { plaintext, key },
    {
      type: "object",
      properties: {
        plaintext: { type: "string" },
        key: { type: "string" },
      },
      required: ["plaintext", "key"],
    }
  );

  const algorithm = "aes-256-cbc";
  const iv = randomBytes(16);
  const cipher = createCipheriv(
    algorithm,
    createHash("sha256").update(key).digest(),
    iv
  );

  return {
    algorithm,
    iv: iv.toString("base64"),
    content: Buffer.concat([cipher.update(plaintext), cipher.final()]).toString(
      "base64"
    ),
  };
}

export function decrypt(encrypted, key) {
  validateArguments(
    { encrypted, key },
    {
      type: "object",
      properties: {
        encrypted: {
          type: "object",
          properties: {
            algorithm: { type: "string" },
            iv: { type: "string" },
            content: { type: "string" },
          },
          required: ["algorithm", "iv", "content"],
        },
        key: { type: "string" },
      },
      required: ["encrypted", "key"],
    }
  );

  const decipher = createDecipheriv(
    encrypted.algorithm,
    createHash("sha256").update(key).digest(),
    Buffer.from(encrypted.iv, "base64")
  );

  return Buffer.concat([
    decipher.update(encrypted.content, "base64"),
    decipher.final(),
  ]).toString("utf8");
}
