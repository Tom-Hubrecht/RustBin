// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2
import { createShortcut } from "@solid-primitives/keyboard";
import { IconTypes } from "solid-icons";
import {
  TbOutlineDeviceDesktop,
  TbOutlineMoonStars,
  TbOutlineSun,
} from "solid-icons/tb";
import { createEffect, createSignal, For } from "solid-js";
import { Dynamic } from "solid-js/web";

type ThemeValue = "system" | "dark" | "light";

const ThemeMap = new Map<ThemeValue, IconTypes>([
  ["system", TbOutlineDeviceDesktop],
  ["dark", TbOutlineMoonStars],
  ["light", TbOutlineSun],
]);

const html = document.querySelector("html")!;

const ThemeSwitcher = () => {
  // Clear the pre-rendered content
  document.getElementById("theme-switcher")!.innerHTML = "";

  const initialTheme = (() => {
    switch (window.sessionStorage.getItem("rustbin-theme")) {
      case "dark":
        return "dark";
      case "light":
        return "light";
      default:
        return "system";
    }
  })();

  const [theme, setTheme] = createSignal<ThemeValue>(initialTheme);
  const [showTheme, setShowTheme] = createSignal<boolean>(false);

  createEffect(() => {
    const t = theme();
    window.sessionStorage.setItem("rustbin-theme", t);

    switch (t) {
      case "system": {
        delete html.dataset.theme;
        break;
      }
      case "dark": {
        html.dataset.theme = "dark";
        break;
      }
      case "light": {
        html.dataset.theme = "light";
        break;
      }
    }
  });

  createShortcut(["Escape"], () => {
    setShowTheme(false);
  });

  return (
    <div
      class="navbar-item has-dropdown"
      classList={{ "is-active": showTheme() }}
    >
      <a
        class="navbar-link is-arrowless"
        onClick={() => setShowTheme((b) => !b)}
      >
        <span class="icon-text">
          <span class="icon">
            <Dynamic component={ThemeMap.get(theme())} size="1.25em" />
          </span>
          <span>Theme</span>
        </span>
      </a>

      <div class="navbar-dropdown is-right is-boxed">
        <For each={Array.from(ThemeMap.entries())}>
          {([mode, icon]) => (
            <a class="navbar-item" onClick={() => setTheme(mode)}>
              <span class="icon-text">
                <span class="icon">{icon({ size: "1.125em" })}</span>
                <span style={{ "text-transform": "capitalize" }}>{mode}</span>
              </span>
            </a>
          )}
        </For>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
