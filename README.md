# ESGrep

Syntactically-aware grep for JavaScript and TypeScript

## Usage as a CLI

Install it with `npm install --global esgrep` or the equivalent using pnpm/yarn/etc, then use it as `esgrep [OPTION...] PATTERN [FILE...]`. If `FILE` is not precised, reads from stdin.

The CLI is basically a wrapper around the `find` lib function and accepts the same [options](#options) and a few more that handle help print and output format. This means that these are logically equivalent:

Reading from stdin:

```sh
echo 'const x: number = 10' | esgrep 'const x = ES_ANY'
```

```ts
find("const x: number = 10", "const x = ES_ANY");
```

Reading from files:

```sh
esgrep 'fetch(ES_ANY, { method: "POST" })' api.js lib.ts
```

```ts
find('fetch(ES_ANY, { method: "POST" })', readFileSomehow("api.js"));
find('fetch(ES_ANY, { method: "POST" })', readFileSomehow("lib.ts"));
```

Passing arguments:

```sh
esgrep --statement -- '(() => {})()' file.js
```

```ts
find("(() => {})()", readFileSomehow("file.js"), { statement: true });
```

> **Note**
>
> When you pass `esgrep --foo bar baz`, `esgrep` has no way to know whether `bar` is the value of `--foo` (current behavior) or if it is a positional argument just like `baz` and `--foo` is a flag option.
>
> You can tell `esgrep` to explicitly start parsing positional arguments by using `--`:
>
> ```sh
> esgrep --foo bar baz
> # Parsed options: { foo: 'bar' }
> # Parsed positional arguments: ['baz']
> esgrep --foo -- bar baz
> # Parsed options: { foo: true }
> # parsed positional arguments: ['bar', 'baz']
> ```

## Usage as a library

Install it with `npm install esgrep` or the equivalent using pnpm/yarn/etc, then import it:

```ts
import { find, findStrings } from "esgrep";
// or
const { find, findStrings } = require("esgrep");
```

For now, the lib only targets Node but it's in the roadmap to target Deno and the Web.

Types should be included in the build so refer to them for the exact types of arguments and returned values. This doc focuses on esgrep scenari rather than spec details.

### `find(pattern, haystack, options?)`

`pattern` and `haystack` are `string`s that represent javascript or typescript code which will be matched based on their [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (and not string representation).

`options` is detailed in [options](#options).

`find` is a [`Generator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) that yields [estree](https://github.com/estree/estree) nodes.

```ts
import { find } from "esgrep";

const pattern = "const x = 10";
const haystack = "const x = /* a number */ 10; const y = 20;";
const matches = find(pattern, haystack);
for (const match of matches) {
  console.log(match);
  // {
  //   type: 'VariableDeclaration',
  //   declarations: [ ... ],
  //   kind: 'const',
  //   range: [ 0, 28 ],
  //   loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } }
  // }
}
```

If you're not comfortable with generators and don't want to use the perf and streaming capabilities they can provide, you can just spread it out into a plain array:

```ts
console.log([...matches]);
// [ { type: 'VariableDeclaration', ... }]
```

### `findStrings(pattern, haystack, options?)`

Basically the same as `find` but iterates over matched strings rather that matched nodes.

```ts
import { findStrings } from "esgrep";

const pattern = "const x = 10";
const haystack = "const x = /* a number */ 10; const y = 20;";
console.log([...findStrings(pattern, haystack)]);
// [ 'const x = /* a number */ 10;' ]
```

## Options

### `-h, --help` (CLI only)

Prints the synopsis and lists CLI options.

```sh
esgrep -h
```

### `-t, --ts`

Include type annotations in the comparison

```ts
import { findStrings } from "esgrep";

const withTS = "const x: number = 10";
const withoutTS = "const x = 10";

console.log([...findStrings(withoutTS, withTS)]); // [ 'const x: number = 10' ]
console.log([...findStrings(withoutTS, withTS, { ts: true })]); // []
```

### `-s, --statement`

If the pattern is an expression statement, lookup the statement itself, and not the expression statement.

```ts
import { findStrings } from "esgrep";

const pattern = "10";
const haystack = "const x = 10";
console.log([...findStrings(pattern, haystack)]);
// [ '10' ]
console.log([...findStrings(pattern, haystack, { statement: true })]);
// []
```

The first search matches the `10` in `const x = 10` because it looks up all _expressions_ of `10`. In plain English, it looks up all the occurrences of "just" the number 10. That is the most intuitive and default behavior.

The second search does not match the `10` in `const x = 10` because it looks up all _statements_ of consisting of only the _expression_ `10`. In plain English, statements are anything that makes the exact same sense when adding a `;` at the end.

The difference is subtle and it usually takes people not familiar with the concept a few articles to have a good grasp on _statements_ vs _expressions_. Why not start with [this one](https://2ality.com/2012/09/expressions-vs-statements.html)?

## About

Want to report a bug? Don't understant the doc? Suggest an improvement? Open an issue!

Contributions are welcomed, the code is still small, clean, and all in TS, so it should be readable and extendable without additional guidance. For big changes, consider opening an issue before opening a PR.

Coded w/ ♡ by [Nino Filiu](https://ninofiliu.com)
