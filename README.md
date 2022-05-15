# ESGrep

Syntactically-aware grep for JavaScript and TypeScript

```console
user@host$ npm install --global esgrep
user@host$ echo "const x: number = 10;" > main.ts
user@host$ esgrep "const x: number = 10;" main.ts
main.ts:1:0:const x: number = 10;
```
