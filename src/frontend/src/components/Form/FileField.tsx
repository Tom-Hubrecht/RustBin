// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { TbOutlineTrash, TbOutlineUpload } from "solid-icons/tb";
import { JSXElement, Show, splitProps } from "solid-js";

import {
  FieldElementProps,
  FieldPath,
  FieldValues,
} from "@modular-forms/solid";

import { pluralize } from "../../utils/misc";

const FileField: <
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
>(
  props: { value: File[]; clear: () => void } & FieldElementProps<
    TFieldValues,
    TFieldPath
  >,
) => JSXElement = (props) => {
  const [field, other] = splitProps(props, ["value"]);

  return (
    <div class="field is-grouped">
      <div class="control">
        <div class="file is-centered has-name">
          <label class="file-label">
            <input class="file-input" type="file" {...other} multiple />
            <span class="file-cta">
              <span class="file-icon">
                <TbOutlineUpload size="1.25em" />
              </span>

              <span class="file-label">Select attachments…</span>
            </span>
            <span
              class="file-name"
              title={field.value.map(({ name }) => name).join("\n")}
            >
              {field.value.length}&nbsp;{pluralize(field.value.length, "file")}
            </span>
          </label>
        </div>
      </div>
      <Show when={field.value.length > 0}>
        <div class="control">
          <button class="button is-shadowless" onClick={props.clear}>
            <span class="icon">
              <TbOutlineTrash />
            </span>
            <span>Clear list</span>
          </button>
        </div>
      </Show>
    </div>
  );
};

export default FileField;
