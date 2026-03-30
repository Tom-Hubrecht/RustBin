// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { createAsync } from "@solidjs/router";
import { createEffect, createSignal, type Component } from "solid-js";

import "highlight.js/scss/default.scss";
import "katex/dist/katex.css";

const DOMPurify = (await import("dompurify")).default;

const renderMathInElement = (
  await import("katex/contrib/auto-render/auto-render.js")
).default;

const markedKatex = (await import("marked-katex-extension")).default;
const { marked } = await import("marked");

let content!: HTMLDivElement;

const MarkownRender: Component<{ content: string }> = (props) => {
  // const [syntax, setSyntax] = createSignal<boolean>(false);
  // const [math, setMath] = createSignal<boolean>(true);

  const md = marked.use(
    markedKatex({
      throwOnError: false,
    }),
  );

  const rendered = createAsync(async () =>
    DOMPurify.sanitize(await md.parse(props.content)),
  );

  createEffect(() => {
    renderMathInElement(content);
  });

  return (
    <div>
      {
        // <div class="field has-addons has-addons-centered">
        //   <div class="control">
        //     <label
        //       class="button is-shadowless"
        //       classList={{ "is-active": syntax() }}
        //     >
        //       <input
        //         type="checkbox"
        //         onChange={(e) => setSyntax(e.target.checked)}
        //         checked={syntax()}
        //       />
        //       <span class="ml-2">Syntax Highlighting</span>
        //     </label>
        //   </div>
        //   <div class="control">
        //     <label
        //       class="button is-shadowless"
        //       classList={{ "is-active": math() }}
        //     >
        //       <input
        //         type="checkbox"
        //         onChange={(e) => setMath(e.target.checked)}
        //         checked={math()}
        //       />
        //       <span class="ml-2">Render Mathematics</span>
        //     </label>
        //   </div>
        // </div>
        //
        // <hr class="my-3" />
      }

      <div ref={content} class="content" innerHTML={rendered()} />
    </div>
  );
};

export default MarkownRender;
