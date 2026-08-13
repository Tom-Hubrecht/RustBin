lib:

{
  /**
    Create a new optional value with an inner value.

    # Type

    ```
    some'<T> = [T];
    none = [];
    option<T> = some'<T> | none;
    some<T> = T -> option<T>;
    ```
  */
  some = x: [ x ];

  /**
    Create a new optional value with no inner value.

    # Type

    ```
    some<T> = [T];
    none' = [];
    option<T> = some<T> | none';
    none<T> = option<T>;
    ```
  */
  none = [ ];

  /**
    Assert that a value is a valid optional value.

    # Type

    ```
    some<T> = [T];
    none = [];
    option<T> = some<T> | none;
    assertValid<T> = option<T> -> option<T>;
    ```
  */
  assertValid =
    option:
    let
      some = builtins.length option == 1;
      none = builtins.length option == 0;
    in

    if !(some || none) then throw "option tuple should have zero or one element" else option;

  /**
    Returns `true` if the provided optional value has an inner value.

    # Type

    ```
    some<T> = [T];
    none = [];
    option<T> = some<T> | none;
    isSome<T> = option<T> -> bool;
    ```
  */
  isSome =
    option:
    let
      some = builtins.length option == 1;
      none = builtins.length option == 0;
    in

    if !(some || none) then throw "option tuple should have zero or one element" else some;

  /**
    Returns the inner value if it exists, `throw`ing otherwise.

    # Type

    ```
    some<T> = [T];
    none = [];
    option<T> = some<T> | none;
    unwrap<T> = option<T> -> T;
    ```
  */
  unwrap =
    option:
    if lib.option.isSome option then builtins.elemAt option 0 else throw "unwrap called on none option";

  /**
    Convert an optional value into a list with zero or one element.

    # Type

    ```
    some<T> = [T];
    none = [];
    option<T> = some<T> | none;
    toList<T> = option<T> -> list<T>;
    ```
  */
  toList = option: option;
}
