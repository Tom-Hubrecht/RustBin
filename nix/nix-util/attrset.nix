lib:

{
  /**
    Convert an attribute set into a list of attribute sets of pairs of names and
    values from the original attribute set.

    # Type

    ```
    toList<T> = attrset<T> -> list<{name: str, value: T}>;
    ```
  */
  toList =
    attrset:
    map (x: {
      name = x;
      value = attrset.${x};
    }) (builtins.attrNames attrset);

  /**
    Apply a function to an attribute set to change and/or remove values from that
    attribute set.

    # Type

    ```
    some<T> = [T];
    none = [];
    option<T> = some<T> | none
    filterMap<T> =
      (str -> T -> option<{name: str, value: T}>) ->
      attrset<T> ->
      attrset<T>;
    ```
  */
  filterMap =
    filterMap: attrset:
    builtins.listToAttrs (
      map (some: lib.option.unwrap some) (
        builtins.filter (option: lib.option.isSome option) (
          map (pair: filterMap pair.name pair.value) (lib.attrset.toList attrset)
        )
      )
    );
}
