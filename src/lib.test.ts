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
      expect([...findStrings(statement, haystack)]).toEqual([statement]);
    }
  });
});

describe("with white space diff", () => {
  it("should find itself", () => {
    for (const statement of statements) {
      for (const w of [" ", "\t", "   "]) {
        expect([
          ...findStrings(statement.replaceAll(" ", w), haystack),
        ]).toEqual([statement]);
      }
    }
  });
});

describe("with comment diff", () => {
  it("should find itself", () => {
    for (const statement of statements) {
      expect([
        ...findStrings(statement.replaceAll(" ", "/* */"), haystack),
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
        expect([...findStrings(statement, blocker(statement))]).toEqual([
          statement,
        ]);
      }
    }
  });
});

describe("options", () => {
  describe("expressionOnly", () => {
    const expressions = [`10`, `await fetch()`, `foo`, `"hello"`];
    const statementers: ((s: string) => string)[] = [
      (s) => `const x = ${s}`,
      (s) => `fn(a,${s},b)`,
      (s) => `const fn = () => {const x = ${s}}`,
    ];
    describe("true (default)", () => {
      it("should find an expression defined by an expression statement", () => {
        for (const expression of expressions) {
          for (const statementer of statementers) {
            expect([
              ...findStrings(expression, statementer(expression)),
            ]).toEqual([expression]);
          }
        }
      });
    });
    describe("false", () => {
      it("should not find an expression defined by an expression statement", () => {
        for (const expression of expressions) {
          for (const statementer of statementers) {
            expect([
              ...findStrings(expression, statementer(expression), {
                expressionOnly: false,
              }),
            ]).toEqual([]);
          }
        }
      });
      it("should find a statement defined by an expression statement", () => {
        for (const expression of expressions) {
          for (const statementer of statementers) {
            const statement = statementer(expression);
            expect([
              ...findStrings(statement, statement, {
                expressionOnly: false,
              }),
            ]).toEqual([statement]);
          }
        }
      });
    });
  });
});
