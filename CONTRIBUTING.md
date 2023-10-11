# How to contribute to ESGrep

Clone the repo

```sh
git clone git@github.com:ninofiliu/esgrep
cd esgrep
```

Install dependencies with [pnpm](https://pnpm.io/installation)

```sh
pnpm install
```

ESGrep uses [typescript-estree](https://typescript-eslint.io/packages/typescript-estree/) for the parsing, which can convert .js/.ts/.jsx/.tsx files into an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) in the [estree](https://github.com/estree/estree) format. Contributors are encouraged to get familiar with these concepts and libs, but thre ESGrep code itself is fairly simple:

The CLI entry point is [src/cli/node.ts](src/cli/node.ts). During dev, you can run it with [tsx](https://github.com/esbuild-kit/tsx):

```sh
tsx src/cli/node.ts --format=count 'const isNode = ES_ANY' src/lib.ts
```

We use [jest](https://jestjs.io/) for testing and run them with

```sh
pnpm test
```

If all looks good, you are welcomed to submit your pull request.
