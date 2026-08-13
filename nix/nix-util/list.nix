lib:

{
  /**
    Remove the elements in `ys` from `xs`.

    # Type

    ```
    subtract<T> = list<T> -> list<any> -> list<T>;
    ```
  */
  subtract = xs: ys: (builtins.filter (x: !(builtins.elem x ys)) xs);
}
