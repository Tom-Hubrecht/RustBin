// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import createClient from "openapi-fetch";

import type { paths } from "./types";

const client = createClient<paths>();

export default client;
