let
  self = {
    attrset = import ./attrset.nix self;
    filesystem = import ./filesystem.nix self;
    list = import ./list.nix self;
    option = import ./option.nix self;
  };
in

self
