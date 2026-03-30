# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkles ? null,
}:

let
  importSprinkle =
    name:
    ((import (source.${name} + "/nix") { }).override {
      input = _: { inherit (input source) nixpkgs sprinkles; };
    }).output;

  source = import ./lon.nix;
  input = source: {
    git-hooks = import (source."git-hooks.nix" + "/nix") {
      inherit (source) nixpkgs;
      gitignore-nix-src = null;
      system = builtins.currentSystem;
    };

    nix-actions = importSprinkle "nix-actions";
    nix-reuse = importSprinkle "nix-reuse";
    nix-util = importSprinkle "nix-util";

    nixpkgs = import source."nixpkgs" { config.allowAliases = false; };

    sprinkles = if sprinkles == null then import source."sprinkles" else sprinkles;
  };
in

(input source).sprinkles.new {
  inherit input source;

  output =
    self:
    let
      inherit (self.input.nix-util.lib.filesystem) loadFromDirectoryRecursive;
      inherit (self.input.nixpkgs) callPackage;
    in
    {
      nixosModules.default = import ./modules/nixos;
      nixosModule = self.output.nixosModules.default;

      overlays.default =
        final: _:
        loadFromDirectoryRecursive {
          directory = ./packages;
          loader = _: path: final.callPackage path { sprinkle = self; };
          target = "package.nix";
        };
      overlay = self.output.overlays.default;

      packages = {
        inherit (self.input.nixpkgs.extend self.output.overlay) dev rustbin;
      };
      package = self.output.packages.rustbin;

      shells = loadFromDirectoryRecursive {
        directory = ./shells;
        loader = _: path: callPackage path { sprinkle = self; };
      };

      workflows = { };

      # Utility exports
      inherit self;

      root = ../.;
    };
}
