// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { TbOutlineDownload } from "solid-icons/tb";
import { Component, For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { PasteFormat } from "../../bindings/Paste";
import { size } from "../../utils/misc";
import MarkownRender from "./components/Markdown";
import PlainTextRender from "./components/Plain";
import SourceCodeRender from "./components/Source";

const ContentRender = (format: PasteFormat) => {
  switch (format) {
    case "plain":
      return PlainTextRender;
    case "source":
      return SourceCodeRender;
    case "markdown":
      return MarkownRender;
  }
};

const Render: Component<{
  content: string;
  attachments: File[];
  format: PasteFormat;
}> = (props) => {
  return (
    <>
      <div class="box">
        <Dynamic
          component={ContentRender(props.format)}
          content={props.content}
        />
      </div>
      <div class="buttons">
        <For each={props.attachments}>
          {(file) => {
            const url = URL.createObjectURL(file);
            const { value, unit } = size(file.size);

            return (
              <a href={url} class="button is-fullwidth is-block">
                <span class="icon is-pulled-left">
                  <TbOutlineDownload />
                </span>
                <span>{file.name}</span>
                <span class="tag is-small is-pulled-right">
                  {value}&nbsp;{unit}
                </span>
              </a>
            );
          }}
        </For>
      </div>
    </>
  );
};

export default Render;
