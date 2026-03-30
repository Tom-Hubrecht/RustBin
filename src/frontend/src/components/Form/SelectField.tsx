// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { For, JSXElement, splitProps } from "solid-js";

import {
  FieldElementProps,
  FieldPath,
  FieldValues,
  Maybe,
} from "@modular-forms/solid";

const SelectField: <
  TValues extends string | number,
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
>(
  props: {
    label: string;
    values: [TValues, string][];
    value: Maybe<TValues>;
  } & FieldElementProps<TFieldValues, TFieldPath>,
) => JSXElement = (props) => {
  const [{ values, label }, field, other] = splitProps(
    props,
    ["values", "label"],
    ["value"],
  );

  return (
    <div class="field is-narrow has-addons">
      <p class="control">
        <a class="button is-static">{label}</a>
      </p>
      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select {...other}>
            <For each={values}>
              {([value, label]) => (
                <option
                  value={value}
                  selected={field.value && field.value === value}
                >
                  {label}
                </option>
              )}
            </For>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SelectField;
