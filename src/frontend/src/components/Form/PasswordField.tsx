// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { TbFillLock, TbOutlineEye, TbOutlineEyeOff } from "solid-icons/tb";
import { createSignal, JSXElement } from "solid-js";

import {
  FieldElementProps,
  FieldPath,
  FieldValues,
} from "@modular-forms/solid";

const PasswordField: <
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
>(
  props: FieldElementProps<TFieldValues, TFieldPath>,
) => JSXElement = (props) => {
  const [showPassword, setShowPassword] = createSignal<boolean>(false);
  return (
    <div class="field is-expanded">
      <div class="field has-addons">
        <p class="control has-icons-left is-expanded">
          <input
            autocomplete="off"
            class="input"
            type={showPassword() ? "text" : "password"}
            placeholder="Password"
            {...props}
          />
          <span class="icon is-small is-left">
            <TbFillLock />
          </span>
        </p>
        <div class="control">
          <a
            class="button is-shadowless"
            onClick={() => setShowPassword((b) => !b)}
          >
            <span class="icon">
              {showPassword() ? <TbOutlineEyeOff /> : <TbOutlineEye />}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordField;
