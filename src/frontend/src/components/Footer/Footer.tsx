// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { TbOutlineSourceCode } from "solid-icons/tb";

const Footer = () => {
  return (
    <footer class="footer">
      <div class="buttons is-centered">
        <a class="button" href="https://github.com/Tom-Hubrecht/RustBin">
          <span class="icon">
            <TbOutlineSourceCode />
          </span>
          <span>Source Code</span>
        </a>

        <a class="button is-primary" href="/mentions-legales">
          <span>Mentions Légales</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
