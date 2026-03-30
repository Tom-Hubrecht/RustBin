# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkle,

  lib,
  mkShellNoCC,

  cargo-watch,
}:

let
  inherit (lib)
    attrValues
    concatMapStringsSep
    genAttrs
    getAttr
    ;

  getHooks = concatMapStringsSep "\n" (getAttr "shellHook");

  shell-parts = genAttrs [
    "git-hooks"
    "nix-actions"
    "nix-reuse"
  ] (name: import (./.. + "/${name}.nix") { inherit sprinkle; });
in

mkShellNoCC {
  name = "rustbin.dev";

  inputsFrom = with sprinkle.output.packages; [
    rustbin
    rustbin.frontend
  ];

  packages = [
    cargo-watch
  ]
  ++ shell-parts.git-hooks.enabledPackages;

  env = {
    LON_DIRECTORY = toString (sprinkle.output.root + "/nix");
    RUST_LOG = "debug";
    TS_RS_EXPORT_DIR = toString (sprinkle.output.root + "/src/frontend/src/bindings");
  };

  shellHook = getHooks (attrValues shell-parts ++ [ { shellHook = "unset shellHook"; } ]);
}
