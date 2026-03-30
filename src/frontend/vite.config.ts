// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin(), compression()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:4004",
    },
  },
  build: {
    target: "esnext",
  },
});
