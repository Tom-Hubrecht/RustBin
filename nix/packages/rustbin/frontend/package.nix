# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkle,

  lib,
  buildNpmPackage,
}:

let
  inherit (lib.fileset)
    intersection
    gitTracked
    toSource
    unions
    ;

  meta = builtins.readFile (root + "/package.json") |> builtins.fromJSON;

  root = sprinkle.root + "/src/frontend";
in

buildNpmPackage {
  pname = meta.name;
  inherit (meta) version;

  src = toSource {
    inherit root;

    fileset = intersection (gitTracked sprinkle.root) (
      unions (
        map (path: root + "/${path}") [
          "src"

          "index.html"

          "package-lock.json"
          "package.json"
          "tsconfig.json"
          "vite.config.ts"
        ]
      )
    );
  };

  npmDepsHash = "sha256-ojr8vWuzYpNT7FKJVRYy2SQBKJ6ekR96A4bHhbgpIZc=";

  installPhase = "mv dist $out";

  meta = {
    description = "A modern, minimalist zero-knowledge pastebin";
    homepage = "https://github.com/Tom-Hubrecht/RustBin";
    license = lib.licenses.eupl12;
  };
}
