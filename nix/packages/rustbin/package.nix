# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkle,

  lib,
  rustPlatform,

  pkg-config,
  openssl,

  callPackage,
}:

let
  inherit (lib.fileset)
    intersection
    gitTracked
    toSource
    unions
    ;

  meta = builtins.readFile (root + "/Cargo.toml") |> fromTOML;

  root = sprinkle.root + "/src/api";
in

rustPlatform.buildRustPackage {
  pname = "rustbin-api";

  inherit (meta.package) version;

  src = toSource {
    inherit root;

    fileset = intersection (gitTracked sprinkle.root) (
      unions (
        map (path: root + "/${path}") [
          "Cargo.lock"
          "Cargo.toml"

          "src"
        ]
      )
    );
  };

  cargoHash = "sha256-yigX9AykcBInAtqJHgnwXVrjOmgkAu1Hu+Y1yxx4ACA=";

  nativeBuildInputs = [
    pkg-config
  ];

  buildInputs = [
    openssl
  ];

  passthru.frontend = callPackage ./frontend/package.nix { inherit sprinkle; };

  meta = {
    description = "A modern, minimalist zero-knowledge pastebin";
    homepage = "https://github.com/Tom-Hubrecht/RustBin";
    license = lib.licenses.eupl12;
    mainProgram = "rustbin";
  };
}
