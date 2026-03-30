// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { For, type Component } from "solid-js";

const SourceCodeRender: Component<{ content: string }> = (props) => {
  return (
    <pre class="numbered">
      <code>
        <For each={props.content.split(/\r?\n/g)}>
          {(line) => <span>{line}</span>}
        </For>
      </code>
    </pre>
  );
};

export default SourceCodeRender;
