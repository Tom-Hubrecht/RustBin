# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

(import ./sprinkles.nix).new (
  self:
  let
    importSprinkleV1 =
      name:
      ((import (self.sources.${name} + "/nix") { sprinkles = import self.sources."sprinkles"; }).override
        {
          input = _: { inherit (self.inputs) nixpkgs; };
        }
      ).output;

    inherit (self.inputs.nix-util.lib.filesystem) loadFromDirectoryRecursive;
    inherit (self.inputs.nixpkgs) callPackage;
  in
  {
    sources = import ./lon.nix;

    inputs = {
      git-hooks = import (self.sources."git-hooks.nix" + "/nix") {
        inherit (self.sources) nixpkgs;
        gitignore-nix-src = null;
        system = builtins.currentSystem;
      };

      nix-actions = importSprinkleV1 "nix-actions";
      nix-reuse = importSprinkleV1 "nix-reuse";
      nix-util = importSprinkleV1 "nix-util";

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
