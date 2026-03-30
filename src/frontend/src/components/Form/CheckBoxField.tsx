// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { JSXElement, splitProps } from "solid-js";

import {
  FieldElementProps,
  FieldPath,
  FieldValues,
  Maybe,
} from "@modular-forms/solid";

const CheckBoxField: <
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
>(
  props: {
    label: string;
    value: Maybe<boolean>;
  } & FieldElementProps<TFieldValues, TFieldPath>,
) => JSXElement = (props) => {
  const [{ label }, field, other] = splitProps(props, ["label"], ["value"]);

  return (
    <div class="field is-narrow">
      <div class="control is-expanded">
        <label
          class="button is-shadowless is-fullwidth"
          classList={{ "is-active": field.value }}
        >
          <input type="checkbox" {...other} />
          <span class="ml-2">{label}</span>
        </label>
      </div>
    </div>
  );
};

export default CheckBoxField;
