lib:

{
  /**
    Recursively call a function for each target file in a directory, producing a
    nested attribute set of the results of the function call.

    In functions passed to the `override` argument, the `str` argument is
    conventionally named `subdir` and the `path` argument is conventionally named
    `path`.

    Given the following file structure:

    ```
    package/group-a/a/default.nix
    package/group-a/b/default.nix
    package/group-b/a/default.nix
    package/group-b/b/default.nix
    package/a/default.nix
    package/b/default.nix
    ```

    When setting `directory` to a path to the `package` directory and `loader` to
    `subdir: path: { inherit path subdir; }`, the following attribute set will be
    produced:

    ```nix
    {
      group-a = {
        a = {
          path = ./package/group-a/a/default.nix;
          subdir = "group-a/a";
        };
        b = {
          path = ./package/group-a/b/default.nix;
          subdir = "group-a/b";
        };
      };
      group-b = {
        a = {
          path = ./package/group-b/a/default.nix;
          subdir = "group-b/a";
        };
        b = {
          path = ./package/group-b/b/default.nix;
          subdir = "group-b/b";
        };
      };
      a = {
        path = ./package/a/default.nix;
        subdir = "a";
      };
      b = {
        path = ./package/b/default.nix;
        subdir = "b";
      };
    }
    ```

    If any particular leaf attribute needs to be handled specially, `override`
    can be provided. The names in the `override` attribute set match the values of
    `subdir`, and the values are functions with the same type as `loader`, which
    will be called instead of `loader` for the given attribute name. Evaluation
    will fail with a helpful error message if a supplied `override` attribute
    would not be called because there is no corresponding path.

    By default, `default.nix` is searched for and passed to `loader`, but this can
    be overridden with the `target` argument.

    # Type

    ```
    loaded<T> = attrset<T | loaded<T>>;
    loadFromDirectoryRecursive<T> = {
      directory: path,
      ?target: str,
      loader: str -> path -> T,
      ?override: attrset<str -> path -> T>,
    } -> loaded<T>;
    ```
  */
  loadFromDirectoryRecursive =
    {
      directory,
      target ? "default.nix",
      loader,
      override ? { },
    }:

    let
      inner =
        {
          directory,
          loader,
          override,
          target,
          prevs,
        }:

        lib.attrset.filterMap (
          name: value:
          let
            subdir = builtins.concatStringsSep "/" (prevs ++ [ name ]);
            hasOverride = builtins.hasAttr subdir override;
            target' = directory + "/${name}/${target}";
          in

          if value != "directory" then
            lib.option.none
          else if builtins.pathExists target' then
            if hasOverride then
              lib.option.some {
                inherit name;
                value = {
                  loaded = override.${subdir} subdir target';
                  override = lib.option.some subdir;
                  recurse = false;
                };
              }
            else
              lib.option.some {
                inherit name;
                value = {
                  loaded = loader subdir target';
                  override = lib.option.none;
                  recurse = false;
                };
              }
          else
            lib.option.some {
              inherit name;
              value = {
                loaded = inner {
                  inherit loader override target;
                  directory = directory + "/${name}";
                  prevs = prevs ++ [ name ];
                };
                override = lib.option.none;
                recurse = true;
              };
            }
        ) (builtins.readDir directory);

      calledInner = inner {
        inherit
          directory
          loader
          override
          target
          ;
        prevs = [ ];
      };

      extractLoaded =
        attrs:
        builtins.mapAttrs (
          name: value: if value.recurse then extractLoaded value.loaded else value.loaded
        ) attrs;

      extractOverride =
        attrs: prev:
        builtins.concatLists (
          map (
            value:
            if value.recurse then
              extractOverride value.loaded prev
            else
              prev ++ (lib.option.toList value.override)
          ) (builtins.attrValues attrs)
        );

      inArgsNotFs = lib.list.subtract (builtins.attrNames override) (extractOverride calledInner [ ]);
    in

    if builtins.length inArgsNotFs == 0 then
      (extractLoaded calledInner)
    else
      throw ''
        overrides were supplied for directories that would not be loaded normally
        help: consider removing them from the `override` attribute set or creating each directory with a `${target}` in them
        attribute names: ${builtins.concatStringsSep ", " inArgsNotFs}
      '';
}
