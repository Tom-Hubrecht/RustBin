# SPDX-FileCopyrightText: 2025 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

sprinkle.inputs.nix-actions.run {
  src = sprinkle.root;

  inherit (sprinkle) workflows;

  buildCheck = false;
  platform = "github";

  yamlStyle = "|";
}
