# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

(import ./sprinkles.nix).new (
  self:
  let
    importSprinkle =
      name: (import self.sources.${name}).follows { inputs = { inherit (self.inputs) nixpkgs; }; };

    inherit (self.inputs.nix-util.filesystem) loadFromDirectoryRecursive;
    inherit (self.inputs.nixpkgs) callPackage;
  in
  {
    sources = import ./lon.nix;

    inputs = {
      nix-util = import ./nix-util;

      git-hooks = import (self.sources."git-hooks.nix" + "/nix") { inherit (self.sources) nixpkgs; };

      nix-actions = importSprinkle "nix-actions";
      nix-reuse = importSprinkle "nix-reuse";

      nixpkgs = import self.sources."nixpkgs" { config.allowAliases = false; };
    };

    nixosModules.default = import ./modules/nixos;
    nixosModule = self.nixosModules.default;

    overlays.default =
      final: _:
      loadFromDirectoryRecursive {
        directory = ./packages;
        loader = _: path: final.callPackage path { sprinkle = self; };
        target = "package.nix";
      };
    overlay = self.overlays.default;

    packages = { inherit (self.inputs.nixpkgs.extend self.overlay) dev rustbin; };
    package = self.packages.rustbin;

    shells = loadFromDirectoryRecursive {
      directory = ./shells;
      loader = _: path: callPackage path { sprinkle = self; };
    };

    workflows = { };

    root = ../.;
  }
)
