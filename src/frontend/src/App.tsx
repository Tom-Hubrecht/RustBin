// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Route, Router } from "@solidjs/router";
import { type Component, For } from "solid-js";
import { createStore, produce } from "solid-js/store";

import Footer from "./components/Footer/Footer";
import NavBar from "./components/NavBar/NavBar";
import Notification from "./components/Notification/Notification";
import { AppShowMethods } from "./constants";
import Create from "./pages/Create";
import Home from "./pages/Home";
import Paste from "./pages/Paste";

type BaseNotification = {
  message: string;
  class?: string;
  classList?: { [k: string]: boolean | undefined };
};

type Store = {
  notifications: { [id: string]: BaseNotification };
};

export type PageComponent = Component<{
  show: AppShowMethods;
}>;

const routes: [string, PageComponent][] = [
  ["/", Home],
  ["/create", Create],
  ["/paste/:id", Paste],
];

const App = () => {
  const [store, setStore] = createStore<Store>({
    notifications: {},
  });

  const deleteNotification = (id: string) =>
    setStore(
      "notifications",
      produce((state) => delete state[id]),
    );

  const notify = (props: BaseNotification & { timeout?: number }) => {
    setStore(
      "notifications",
      produce((state) => {
        const id = self.crypto.randomUUID();

        state[id] = props;

        if (props.timeout) {
          setTimeout(() => deleteNotification(id), props.timeout);
        }
      }),
    );
  };

  const mkShow =
    (cls: string) =>
    (message: string, timeout: number = 10000) => {
      notify({ message, class: cls, timeout });
    };

  const show: AppShowMethods = {
    error: mkShow("is-danger"),
    success: mkShow("is-success"),
    warn: mkShow("is-warning"),
  };

  return (
    <>
      <NavBar />

      <div id="notifications">
        <For each={Object.entries(store.notifications).reverse()}>
          {([id, props]) => {
            return (
              <Notification delete={() => deleteNotification(id)} {...props} />
            );
          }}
        </For>
      </div>

      <main>
        <Router>
          <For each={routes}>
            {([path, Page]) => (
              <Route {...{ path, component: () => <Page {...{ show }} /> }} />
            )}
          </For>
        </Router>
      </main>

      <Footer />
    </>
  );
};

export default App;
