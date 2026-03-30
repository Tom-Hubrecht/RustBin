// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { TbOutlineEraser } from "solid-icons/tb";
import { Component, createEffect, createSignal } from "solid-js";

import type { AppShowMethods, SentData } from "../../constants";
import client from "../../utils/api";
import { select } from "../../utils/select";

let link!: HTMLAnchorElement;

const PasteSent: Component<
  { onDelete: () => void; show: AppShowMethods } & SentData
> = ({ onDelete, id, token, master, show }) => {
  const [loading, setLoading] = createSignal<boolean>(false);

  const deletePaste = async () => {
    setLoading(true);

    const res = await client.DELETE("/api/v1/paste/{id}", {
      params: { path: { id } },
      body: { token },
    });

    if (res.data) {
      show.success(`Deleted paste ${res.data}`, 1000);
      onDelete();
    } else {
      if (res.error) {
        show.error(res.error);
      } else {
        show.warn(`HTTP ${res.response.status}, ${res.response.statusText}`);
      }
    }

    setLoading(false);
  };

  const url = `${new URL(`/paste/${id}`, document.baseURI).toString()}#${master}`;

  createEffect(() => select(link));

  return (
    <section class="notification content my-5">
      <b class="tag is-primary is-pulled-right">Use Ctrl+C to copy</b>

      <h4>Paste created:</h4>
      <a style="word-break: break-all;" ref={link} onClick={() => select(link)}>
        {url}
      </a>

      <a
        class="button is-danger is-fullwidth mt-5"
        classList={{ "is-loading": loading() }}
        onClick={deletePaste}
      >
        <span class="icon">
          <TbOutlineEraser />
        </span>
        <span>Erase the paste</span>
      </a>
    </section>
  );
};

export default PasteSent;
