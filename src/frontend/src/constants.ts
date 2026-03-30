// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import type { ExpiryTime, PasteFormat } from "./bindings/Paste";

export const ExpiringTimeValues = [
  "5min",
  "10min",
  "1h",
  "1d",
  "1w",
  "1m",
  "1y",
  "never",
];

export const PasteFormatValues: [PasteFormat, string][] = [
  ["plain", "Plain Text"],
  ["source", "Source Code"],
  ["markdown", "Markdown"],
];

export const base58Chars =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const base64Chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export type PasteCreateForm = {
  expiry: ExpiryTime;
  burn: boolean;
  password: string;
  attachments: File[];
  format: PasteFormat;
  content: string;
};

type ShowMethods = "error" | "success" | "warn";

export type SentData = {
  id: string;
  token: string;
  master: string;
};

export type AppShowMethods = {
  [k in ShowMethods]: (message: string, timeout?: number) => void;
};
