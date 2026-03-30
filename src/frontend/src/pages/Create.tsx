// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import {
  TbOutlineCloudUpload,
  TbOutlineRepeat,
  TbOutlineTrash,
} from "solid-icons/tb";
import { createMemo, For, Show } from "solid-js";
import { createSignal } from "solid-js";

import {
  createForm,
  getValue,
  setValue,
  SubmitHandler,
} from "@modular-forms/solid";

import type { PageComponent } from "../App";
import { PasteFormat } from "../bindings/Paste";
import CheckBoxField from "../components/Form/CheckBoxField";
import FileField from "../components/Form/FileField";
import PasswordField from "../components/Form/PasswordField";
import SelectField from "../components/Form/SelectField";
import PasteSent from "../components/Notification/PasteSent";
import Render from "../components/Render/Render.tsx";
import {
  ExpiringTimeValues,
  PasteFormatValues,
  SentData,
  type PasteCreateForm,
} from "../constants";
import client from "../utils/api";
import { cipher, createCipherMessage } from "../utils/crypto";

type State = "editor" | "preview" | "sent" | "deleted";

const Create: PageComponent = ({ show }) => {
  const [form, { Form, Field }] = createForm<PasteCreateForm>();

  const [state, setState] = createSignal<State>("editor");

  const content = createMemo<string>(
    (prev) => getValue(form, "content") ?? prev,
    "",
  );

  const format = createMemo<PasteFormat>(
    (prev) => getValue(form, "format") ?? prev,
    "plain",
  );

  const attachments = createMemo<File[]>(
    (prev) => getValue(form, "attachments") ?? prev,
    [],
  );

  const [sent, setSent] = createSignal<SentData>();

  const handleSubmit: SubmitHandler<PasteCreateForm> = async (values) => {
    const { content, attachments, password, format, burn, expiry } = values;

    if (content.length || attachments.length) {
      const message = await createCipherMessage(content, attachments);

      if (message === undefined) {
        show.error("Could not serialize the paste data.");
        return;
      }

      const { payload, master, additionalData } = await cipher(
        password,
        message,
        { format, burn },
      );

      const res = await client.POST("/api/v1/paste", {
        body: {
          additional_data: additionalData,
          content: payload,
          expiry,
        },
      });

      if (res.error !== undefined) {
        show.error(res.error);
      } else {
        setSent({ master, ...res.data, content, attachments });
        setState("sent");
      }
    } else {
      show.warn("No data to send", 1000);
    }
  };

  return (
    <div class="container p-5">
      <Show when={["editor", "preview"].includes(state())}>
        <h2 class="subtitle">Create a new Paste</h2>
        <Form onSubmit={handleSubmit}>
          <div class="field is-horizontal">
            <div class="field-body">
              <Field name="password">
                {(_, props) => <PasswordField {...props} />}
              </Field>

              <Field name="expiry">
                {(field, props) => (
                  <SelectField
                    value={field.value}
                    label="Expires"
                    values={ExpiringTimeValues.map((x) => [x, x])}
                    {...props}
                  />
                )}
              </Field>

              <Field name="format">
                {(field, props) => (
                  <SelectField
                    value={field.value}
                    label="Format"
                    values={PasteFormatValues}
                    {...props}
                  />
                )}
              </Field>

              <Field name="burn" type="boolean">
                {(field, props) => (
                  <CheckBoxField
                    value={field.value}
                    label="Burn after reading"
                    {...props}
                  />
                )}
              </Field>
            </div>
          </div>

          <Field name="attachments" type="File[]">
            {(field, props) => (
              <FileField
                value={field.value ?? []}
                clear={() => setValue(form, "attachments", [])}
                {...props}
              />
            )}
          </Field>

          <hr class="my-4" />

          <div class="level is-mobile">
            <div class="level-left">
              <div class="tabs">
                <ul>
                  <For each={["editor", "preview"] as const}>
                    {(mode) => (
                      <li classList={{ "is-active": mode === state() }}>
                        <a
                          style={{ "text-transform": "capitalize" }}
                          onClick={() => setState(mode)}
                        >
                          {mode}
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>

            <div class="level-right">
              <button
                class="button"
                classList={{ "is-loading": form.submitting }}
                type="submit"
              >
                <span class="icon">
                  <TbOutlineCloudUpload />
                </span>
                <span>Create</span>
              </button>
            </div>
          </div>

          <Field name="content">
            {(_field, props) => (
              <div class="field">
                <div class="control">
                  <textarea
                    {...props}
                    classList={{ "is-hidden": state() !== "editor" }}
                    class="textarea is-primary has-fixed-size"
                    placeholder="Paste Content"
                    style={{ height: "50vh", "max-height": "none" }}
                  ></textarea>
                </div>
              </div>
            )}
          </Field>
        </Form>
      </Show>

      <Show when={state() === "deleted"}>
        <section class="notification content has-text-centered my-5">
          <p class="icon-text">
            <span class="icon">
              <TbOutlineTrash />
            </span>
            <span>
              <b>Paste deleted.</b>
            </span>
          </p>

          <p>
            <a class="button is-primary" target="_self" href="/create">
              <span class="icon-text">
                <span class="icon">
                  <TbOutlineRepeat />
                </span>
                <span>Create a new paste</span>
              </span>
            </a>
          </p>
        </section>
      </Show>

      <Show when={state() === "sent"}>
        <PasteSent
          {...sent()!}
          onDelete={() => setState("deleted")}
          show={show}
        />
      </Show>

      <Show when={["preview", "sent"].includes(state())}>
        <Render
          format={format()}
          content={content()}
          attachments={attachments()}
        />
      </Show>
    </div>
  );
};

export default Create;
