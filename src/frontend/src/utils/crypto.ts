// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import baseX from "base-x";
import stringify from "canonical-json";

import { AdditionalData, PasteFormat } from "../bindings/Paste";
import { base58Chars, base64Chars } from "../constants";
import { toBase64 } from "./misc";

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 250_000;

const base58 = baseX(base58Chars);
const base64 = baseX(base64Chars);

const getRandomByteArray = (length: number) =>
  window.crypto.getRandomValues(new Uint8Array(length));

export const generateSymmetricKey = () => getRandomByteArray(32);

export const deriveKey = async (
  master: string,
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> => {
  const algorithm: Pbkdf2Params = {
    name: "PBKDF2", // we use PBKDF2 for key derivation
    salt, // salt used in HMAC
    iterations, // amount of iterations to apply
    hash: "SHA-512", // can be "SHA-256", "SHA-384" or "SHA-512"
  };

  const keyData = encoder.encode(master.concat(password));
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    "PBKDF2", // we use PBKDF2 for key derivation
    false, // the key may not be exported
    ["deriveKey"], // the key can only be used for derivation
  );
  const derivedKeyType: AesDerivedKeyParams = {
    name: "AES-GCM",
    length: 256,
  };
  const extractable = false; // the key may not be exported
  const keyUsages: KeyUsage[] = ["encrypt", "decrypt"]; // we may only use it for en- and decryption

  return await window.crypto.subtle.deriveKey(
    algorithm,
    baseKey,
    derivedKeyType,
    extractable,
    keyUsages,
  );
};

type ProcessedMessage = {
  paste: string;
  attachments: { name: string; data: string }[];
};

export const createCipherMessage = async (
  paste: string,
  attachments: File[],
) => {
  const encoded: { data: string; name: string }[] = [];

  for (const file of attachments) {
    await toBase64(file).then((data) =>
      encoded.push({ data, name: file.name }),
    );
  }

  return stringify({
    paste,
    attachments: encoded,
  });
};

export const cipher = async (
  password: string,
  message: string,
  props: {
    format: PasteFormat;
    burn: boolean;
  },
) => {
  const iv = getRandomByteArray(16);
  const salt = getRandomByteArray(8);

  const additionalData: AdditionalData = {
    type: "v1",
    iv: base64.encode(iv),
    salt: base64.encode(salt),
    ...props,
    PBKDF2_ITERATIONS,
  };

  const algorithm: AesGcmParams = {
    name: "AES-GCM",
    iv,
    tagLength: 128,
    additionalData: encoder.encode(stringify(additionalData)),
  };

  const master = base58.encode(generateSymmetricKey());
  const key = await deriveKey(master, password, salt);

  const gz = new CompressionStream("gzip");
  const stream = new Response(message).body;

  if (stream === null) {
    throw new Error("Could not create a stream from the given content.");
  }

  const data = await new Response(stream.pipeThrough(gz)).arrayBuffer();

  const payload = await window.crypto.subtle
    .encrypt(algorithm, key, data)
    .then((buf) => toBase64(new File([buf], "payload")));

  return { additionalData, master, payload };
};

export const decipher = async (
  data: ArrayBuffer,
  additionalData: AdditionalData,
  master: string,
  password: string,
) => {
  const iv = base64.decode(additionalData.iv).slice();
  const salt = base64.decode(additionalData.salt).slice();

  const algorithm: AesGcmParams = {
    name: "AES-GCM",
    iv,
    tagLength: 128,
    additionalData: encoder.encode(stringify(additionalData)),
  };

  const key = await deriveKey(
    master,
    password,
    salt,
    additionalData.PBKDF2_ITERATIONS,
  );

  try {
    const compressed = await crypto.subtle.decrypt(algorithm, key, data);

    const ds = new DecompressionStream("gzip");
    const stream = new Response(compressed).body;

    if (stream === null) {
      throw new Error("Could not create a stream from the given content.");
    }

    const processed = (await new Response(
      stream.pipeThrough(ds),
    ).json()) as ProcessedMessage;

    // Reconstruct the files from their encoding
    const attachments: File[] = [];

    for (const { name, data } of processed.attachments) {
      const blob = await fetch(data).then((res) => res.blob());
      attachments.push(new File([blob], name, { type: blob.type }));
    }

    return { paste: processed.paste, attachments };
  } catch (error) {
    if (error instanceof DOMException) {
      return { error: error.message, locked: true };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: `${error}` };
  }
};
