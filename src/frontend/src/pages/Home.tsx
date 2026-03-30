// SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import type { PageComponent } from "../App";

const Home: PageComponent = ({}) => (
  <>
    <section class="hero is-primary">
      <div class="hero-body content">
        <h1 class="has-text-primary-dark">RustBin</h1>

        <p>
          <b>RustBin</b> is a modern, open-source pastebin where the server has
          no knowledge of the stored data.
        </p>
      </div>
    </section>
  </>
);

export default Home;
