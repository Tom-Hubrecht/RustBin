// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { useLocation, useParams } from "@solidjs/router";
import {
  TbOutlineDownload,
  TbOutlineFileText,
  TbOutlineForms,
  TbOutlineHourglassLow,
  TbOutlineQrcode,
  TbOutlineShieldLock,
} from "solid-icons/tb";
import {
  createResource,
  Show,
  Suspense,
  Switch,
  Match,
  createEffect,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";

import { createForm } from "@modular-forms/solid";

import type { PageComponent } from "../App";
import { AdditionalData, PasteFormat } from "../bindings/Paste";
import PasswordField from "../components/Form/PasswordField";
import Render from "../components/Render/Render.tsx";
import client from "../utils/api";
import { decipher } from "../utils/crypto";
import qrcodegen from "../utils/qr";

const PasteInfo = (props: { burn: boolean; expires?: Date }) => {
  return (
    <Switch>
      <Match when={props.burn}>
        <div class="notification is-primary is-light has-text-centered">
          <span class="icon-text">
            <span class="icon mr-1">
              <TbOutlineShieldLock size="1.5em" />
            </span>
            <span>
              <b>
                Do not close this window as this paste cannot be displayed
                again.
              </b>
            </span>
          </span>
        </div>
      </Match>
      <Match when={props.expires}>
        {(date) => (
          <div class="notification is-link is-light has-text-centered">
            <span class="icon-text">
              <span class="icon">
                <TbOutlineHourglassLow />
              </span>
              <span>This paste will expire on {date().toLocaleString()}</span>
            </span>
          </div>
        )}
      </Match>
    </Switch>
  );
};

type PasteState = {
  master: string;
  password: string;

  share: boolean;

  locked?: boolean;

  error?: string;

  info?: {
    burn: boolean;
    expires: Date;
  };

  encrypted?: {
    data: ArrayBuffer;
    additionalData: AdditionalData;
  };

  decrypted?: {
    content: string;
    attachments: File[];
    format: PasteFormat;
  };
};

const Paste: PageComponent = ({}) => {
  const params = useParams();
  const location = useLocation();

  const [state, setState] = createStore<PasteState>({
    master: location.hash.replace(/^#/, ""),
    password: "",
    share: false,
  });

  const qr = qrcodegen.QrCode.encodeSegments(
    qrcodegen.QrSegment.makeSegments(
      `${new URL(`/paste/${params.id}`, document.baseURI).toString()}#${state.master}`,
    ),
    qrcodegen.QrCode.Ecc.HIGH,
  );
  const qrSVG = Array.from({ length: qr.size * qr.size }, (_, k) => [
    k % qr.size,
    Math.trunc(k / qr.size),
  ])
    .filter(([x, y]) => qr.getModule(x, y))
    .map(([x, y]) => `M${x + 1},${y + 1}h1v1h-1z`)
    .join(" ");

  const [loading, setLoading] = createSignal<boolean>(false);

  const [paste] = createResource(state.master && params.id, (id) =>
    client.GET("/api/v1/paste/{id}", { params: { path: { id } } }),
  );

  const [_, { Form, Field }] = createForm<{ password: string }>();

  createEffect(async () => {
    // Store the different data values
    const p = paste();

    if (p) {
      const { data, error, response } = p;

      if (data) {
        setState("encrypted", {
          data: await fetch(data.content).then((res) => res.arrayBuffer()),
          additionalData: data.data,
        });
        setState("info", {
          burn: data.data.burn,
          expires: data.expires ? new Date(`${data.expires}Z`) : undefined,
        });
      } else {
        setState(
          "error",
          error ?? `HTTP ${response.status}: ${response.statusText}`,
        );
      }
    }
  });

  createEffect(async () => {
    // Try to decipher the encrypted content
    const encrypted = state.encrypted;

    if (encrypted) {
      setLoading(true);

      const { error, locked, paste, attachments } = await decipher(
        encrypted.data,
        encrypted.additionalData,
        state.master,
        state.password,
      );

      setLoading(false);

      if (error) {
        setState("error", error);
        setState("locked", locked);
      } else {
        setState("locked", undefined);
        setState("error", undefined);

        setState("decrypted", {
          content: paste,
          attachments,
          format: state.encrypted?.additionalData.format,
        });
      }
    }
  });

  return (
    <>
      <div class="modal" classList={{ "is-active": state.share }}>
        <div
          class="modal-background"
          onClick={() => setState("share", false)}
        ></div>
        <div class="modal-card">
          <section class="modal-card-body">
            <figure>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${qr.size + 2} ${qr.size + 2}`}
                stroke="none"
                id="qr-share"
              >
                <rect width="100%" height="100%" />
                <path d={qrSVG} />
              </svg>
            </figure>
          </section>
        </div>
        <button
          class="modal-close is-large"
          aria-label="close"
          onClick={() => setState("share", false)}
        ></button>
      </div>

      <div class="container p-5">
        <Suspense
          fallback={
            <section class="notification has-text-centered">
              Fetching the paste data
            </section>
          }
        >
          <Show when={paste()}>
            <Show when={state.info}>{(info) => <PasteInfo {...info()} />}</Show>

            <Switch>
              <Match when={state.locked}>
                <div class="notification">
                  <div class="has-text-centered block">
                    <span class="icon-text">
                      <span class="icon">
                        <TbOutlineForms />
                      </span>
                      <span>
                        <b>Enter the paste password</b>
                      </span>
                    </span>
                  </div>
                  <Form
                    onSubmit={({ password }) => setState("password", password)}
                  >
                    <div class="field is-horizontal">
                      <div class="field-body">
                        <Field name="password">
                          {(_, props) => <PasswordField {...props} />}
                        </Field>

                        <button
                          type="submit"
                          class="button is-primary"
                          classList={{ "is-loading": loading() }}
                        >
                          Decrypt
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>
              </Match>

              <Match when={state.error}>
                {(error) => (
                  <section class="notification content has-text-centered is-danger">
                    <b>An error occurred while fetching the paste:</b>
                    <br />
                    {error()}
                  </section>
                )}
              </Match>

              <Match when={state.decrypted}>
                {(data) => {
                  const { content, format } = data();
                  const paste = new Blob([content], {
                    type: "text/plain",
                  });
                  const url = URL.createObjectURL(paste);

                  return (
                    <>
                      <hr />
                      <div class="buttons is-centered mb-5">
                        <a href="/create" class="button is-primary">
                          New Paste
                        </a>
                        <a
                          href={url}
                          download={`${params.id}.${format === "markdown" ? "md" : "txt"}`}
                          class="button is-scheme"
                        >
                          <span class="icon">
                            <TbOutlineDownload />
                          </span>
                          <span>Download Paste</span>
                        </a>
                        <a href={url} target="_blank" class="button is-scheme">
                          <span class="icon">
                            <TbOutlineFileText />
                          </span>
                          <span>Raw Text</span>
                        </a>
                        <Show when={!state.info?.burn}>
                          <button
                            class="button is-scheme"
                            onClick={() => setState("share", true)}
                          >
                            <span class="icon">
                              <TbOutlineQrcode />
                            </span>
                            <span>Share</span>
                          </button>
                        </Show>
                      </div>

                      <Render {...data()} />
                    </>
                  );
                }}
              </Match>
            </Switch>
          </Show>
        </Suspense>
      </div>
    </>
  );
};

export default Paste;
