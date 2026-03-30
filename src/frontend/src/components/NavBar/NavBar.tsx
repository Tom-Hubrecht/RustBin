// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { createShortcut } from "@solid-primitives/keyboard";
import { IconTypes } from "solid-icons";
import {
  TbOutlineDeviceDesktop,
  TbOutlineFilePlus,
  TbOutlineKey,
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

const NavBar = () => {
  const html = document.querySelector("html")!;

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
  const [showMenu, setShowMenu] = createSignal<boolean>(false);

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
    setShowMenu(false);
  });

  return (
    <nav
      class="navbar is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a class="navbar-item" target="_self" href="/">
          <span class="icon">
            <TbOutlineKey size="1.5em" />
          </span>
          <span>Home</span>
        </a>

        <a
          role="button"
          class="navbar-burger"
          classList={{ "is-active": showMenu() }}
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setShowMenu((b) => !b)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" classList={{ "is-active": showMenu() }}>
        <div class="navbar-start">
          <a class="navbar-item" target="_self" href="/documentation">
            Documentation
          </a>
          <a class="navbar-item" target="_self" href="/create">
            <span class="icon-text">
              <span class="icon">
                <TbOutlineFilePlus size="1.25em" />
              </span>
              <span>Create</span>
            </span>
          </a>
        </div>

        <div class="navbar-end">
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
                      <span style={{ "text-transform": "capitalize" }}>
                        {mode}
                      </span>
                    </span>
                  </a>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
