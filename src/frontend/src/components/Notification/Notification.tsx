// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component, Show } from "solid-js";

export type NotificationProps = {
  class?: string;
  classList?: { [k: string]: boolean | undefined };
  delete?: () => void;
  message: string;
};

const Notification: Component<NotificationProps> = (props) => {
  return (
    <div
      class={props.class}
      classList={{
        notification: true,
        ...props.classList,
      }}
    >
      <Show when={props.delete}>
        <button class="delete" onClick={props.delete}></button>
      </Show>
      {props.message}
    </div>
  );
};

export default Notification;
