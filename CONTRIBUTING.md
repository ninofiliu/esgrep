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

ESGrep uses [typescript-estree](https://typescript-eslint.io/packages/typescript-estree/) for the parsing, which can convert .js/.ts/.jsx/.tsx files into an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) in the [estree](https://github.com/estree/estree) format. Contributors are encouraged to get familiar with these concepts and libs, but thre ESGrep code itself is fairly simple, short and self-readable.

After your contribution is done, make sure you fix existing tests and if necessary add new ones. Run tests with

```sh
pnpm test
```

and if they pass, submit your pull requests.
