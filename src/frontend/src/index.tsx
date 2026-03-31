// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2
/* @refresh reload */
import { render } from "solid-js/web";

import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import "bulma";

import App from "./App";
import ThemeSwitcher from "./components/NavBar/ThemeSwitcher";
import "./rustbin.scss";

const root = document.getElementById("root");
const themeSwitcher = document.getElementById("theme-switcher");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
render(() => <ThemeSwitcher />, themeSwitcher!);
