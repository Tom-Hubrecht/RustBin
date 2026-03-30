// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { type Component } from "solid-js";

const PlainTextRender: Component<{ content: string }> = (props) => {
  return <pre><code>{props.content}</code></pre>;
};

export default PlainTextRender;
