# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

sprinkle.inputs.nix-reuse.run {
  downloadLicenses = true;

  defaultCopyright = "Tom Hubrecht";

  generatedPaths = [
    ".envrc"

    ".gitignore"
    "src/api/.gitignore"
    "src/frontend/.gitignore"

    "src/api/Cargo.lock"
    "src/api/Cargo.toml"

    "src/frontend/package.json"
    "src/frontend/package-lock.json"

    "src/frontend/src/utils/api/types.d.ts"
    "src/frontend/src/bindings/Paste.ts"

    "nix/lon.lock"
  ];

  annotations = [
  ];
}
