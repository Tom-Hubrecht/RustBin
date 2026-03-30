// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { type Config } from "prettier";

const config: Config = {
  trailingComma: "all",
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
  ],
  importOrder: [
    "^(@solidjs|solid-js|@solid-primitives|solid-icons)(/(.*))?$",
    "<THIRD_PARTY_MODULES>",
    "^[./]",
  ],
  importOrderSeparation: true,
};

export default config;
