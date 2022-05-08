# esgrep

Syntactically-aware grep for JavaScript and TypeScript

```console
user@host$ npm install --global esgrep
user@host$ cat "const x: number = 10;" > main.ts
user@host$ esgrep "const x = JS_ANY" main.ts
const x: number = 10;
```
