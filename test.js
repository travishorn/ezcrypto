import assert from "node:assert";
import { encrypt, decrypt } from "./index.js";

describe("encrypt", () => {
  it("Should error on missing plaintext", () => {
    assert.throws(() => { encrypt(); });
  });

  it("Should error on missing key", () => {
    assert.throws(() => { encrypt("my plaintext"); });
  });

  it("Should return an object", () => {
    const encrypted = encrypt("my plaintext", "my key");
    assert.equal(typeof encrypted, "object");
  });
});

describe("decrypt", () => {
  it("Should error on missing encryption object", () => {
    assert.throws(() => { decrypt(); });
  });

  it("Should error on malformed encryption object", () => {
    assert.throws(() => {
      decrypt(
        {
          algorithm: "aes-256-ctr",
          iv: "iv",
          // notice missing content
        },
        "my key",
      );
    });
  });

  it("Should error on missing key", () => {
    const encrypted = encrypt("my plaintext", "my key");
    assert.throws(() => { decrypt(encrypted); });
  });

  it("Should return the original plaintext", () => {
    const plaintext = "my plaintext";
    const key = "my key";

    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted, key);

    assert.equal(decrypted, plaintext);
  });
});
