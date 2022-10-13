import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import Ajv from "ajv";

const ajv = new Ajv();

const algorithm = "aes-256-ctr";

const validateArguments = (args, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(args);
  if (!valid) throw validate.errors;
};

const createKey = (buf) => {
  return createHash("sha256").update(String(buf)).digest("base64").slice(0, 32);
};

export const encrypt = (plaintext, key) => {
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

  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, createKey(key), iv);
  const content = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    algorithm,
    iv: iv.toString("base64"),
    content: content.toString("base64"),
  };
};

export const decrypt = (encrypted, key) => {
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
    createKey(key),
    Buffer.from(encrypted.iv, "base64")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString();
};
