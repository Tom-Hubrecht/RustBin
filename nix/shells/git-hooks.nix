# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

let
  inherit (sprinkle.inputs.nixpkgs.lib) genAttrs recursiveUpdate;
in

sprinkle.inputs.git-hooks.run {
  src = sprinkle.root;

  default_stages = [ "pre-push" ];

  hooks =
    recursiveUpdate
      (genAttrs
        [
          # Nix files
          "nixfmt"

          # Rust files
          "clippy"
          "rustfmt"
        ]
        (_: {
          enable = true;
        })
      )
      {
        clippy.settings.offline = false;

        reuse = sprinkle.inputs.nix-reuse.gitHook { };
      };

  settings.rust.cargoManifestPath = "src/api/Cargo.toml";
}
