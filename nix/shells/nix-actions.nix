# SPDX-FileCopyrightText: 2025 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

sprinkle.input.nix-actions.run {
  src = sprinkle.output.root;

  inherit (sprinkle.output) workflows;

  buildCheck = false;
  platform = "github";

  yamlStyle = "|";
}
