import { findStrings } from "./lib";

const statements = [
  `import foo from './bar';`,
  `const x: number = 10;`,
  `const y: string = "hello";`,
  `const z = () => { };`,
  `throw new Error('oooh');`,
];
const haystack = statements.join("\n");

describe("with exact matches", () => {
  it(`should find itself`, () => {
    for (const statement of statements) {
      expect([...findStrings(haystack, statement)]).toEqual([statement]);
    }
  });
});

describe("with white space diff", () => {
  it("should find itself", () => {
    for (const statement of statements) {
      for (const w of [" ", "\t", "   "]) {
        expect([
          ...findStrings(haystack, statement.replaceAll(" ", w)),
        ]).toEqual([statement]);
      }
    }
  });
});

describe("with comment diff", () => {
  it("should find itself", () => {
    for (const statement of statements) {
      expect([
        ...findStrings(haystack, statement.replaceAll(" ", "/* */")),
      ]).toEqual([statement]);
    }
  });
});

describe("inside blocks", () => {
  it("should find itself", () => {
    const blockers: ((statement: string) => string)[] = [
      (s) => `{${s}}`,
      (s) => `() => {${s}}`,
      (s) => `const fn = () => {${s}}`,
      (s) => `class A { b() { something; ${s}; const somethingElse = 20; }}`,
    ];
    for (const blocker of blockers) {
      for (const statement of statements) {
        expect([...findStrings(blocker(statement), statement)]).toEqual([
          statement,
        ]);
      }
    }
  });
});
