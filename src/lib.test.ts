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

describe("with several exact matches", () => {
  it("should find itself several times", () => {
    for (const statement of statements) {
      expect([
        ...findStrings(statement, [statement, statement, statement].join("\n")),
      ]).toEqual([statement, statement, statement]);
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
  describe("statement", () => {
    const expressions = [`10`, `await fetch()`, `foo`, `"hello"`];
    const statementers: ((s: string) => string)[] = [
      (s) => `const x = ${s}`,
      (s) => `fn(a,${s},b)`,
      (s) => `const fn = () => {const x = ${s}}`,
    ];
    describe("false (default)", () => {
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
    describe("true", () => {
      it("should not find an expression defined by an expression statement", () => {
        for (const expression of expressions) {
          for (const statementer of statementers) {
            expect([
              ...findStrings(expression, statementer(expression), {
                statement: true,
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
                statement: true,
              }),
            ]).toEqual([statement]);
          }
        }
      });
    });
  });

  describe("ts", () => {
    const withTS = "const x: number = 10;";
    const withoutTS = "const x = 10;";
    describe("false (default)", () => {
      it("should match regardless of type annotations", () => {
        expect([...findStrings(withTS, withoutTS)]).toEqual([withoutTS]);
        expect([...findStrings(withoutTS, withTS)]).toEqual([withTS]);
      });
    });
    describe("true", () => {
      it("should not match if type annotations differ", () => {
        expect([...findStrings(withTS, withTS, { ts: true })]).toEqual([
          withTS,
        ]);
        expect([...findStrings(withTS, withoutTS, { ts: true })]).toEqual([]);
        expect([...findStrings(withoutTS, withTS, { ts: true })]).toEqual([]);
        expect([...findStrings(withoutTS, withoutTS, { ts: true })]).toEqual([
          withoutTS,
        ]);
      });
    });
  });

  describe("raw", () => {
    const strings = [`"foo\\"bar'baz"`, `'foo"bar\\'baz'`, "`foo\"bar'baz`"];
    describe("false (default)", () => {
      it("should match the same strings written differently", () => {
        for (const sa of strings) {
          for (const sb of strings) {
            expect([...findStrings(sa, sb)]).toEqual([sb]);
          }
        }
      });
    });
    describe("true", () => {
      it("should not match the same strings written differently", () => {
        for (const sa of strings) {
          for (const sb of strings) {
            expect([...findStrings(sa, sb, { raw: true })]).toEqual(
              sa === sb ? [sb] : []
            );
          }
        }
      });
    });
  });
});

describe("ES expressions", () => {
  describe("ES_ANY", () => {
    it("should match anything", () => {
      expect([...findStrings("ES_ANY", "function fn() { foo(); }")]).toEqual([
        "function fn() { foo(); }",
        "{ foo(); }",
        "foo();",
        "foo()",
        "foo",
        "fn",
      ]);
      expect([
        ...findStrings("const x = ES_ANY", "const x = 10; const x = 20;"),
      ]).toEqual(["const x = 10;", "const x = 20;"]);
      expect([...findStrings("fetch(ES_ANY)", "fetch('url')")]).toEqual([
        "fetch('url')",
      ]);
    });
  });

  describe("ES_EVERY", () => {
    it("no options: matches", () => {
      expect([...findStrings("const x = ES_EVERY()", "const x = 10")]).toEqual([
        "const x = 10",
      ]);
    });
    it("no matching option: does not match", () => {
      expect([
        ...findStrings("const x = ES_EVERY(20, 30)", "const x = 10"),
      ]).toEqual([]);
    });
    it("one matching option: does not match", () => {
      expect([
        ...findStrings("const x = ES_EVERY(10, 20)", "const x = 10"),
      ]).toEqual([]);
    });
    it("all matching options: matches", () => {
      expect([
        ...findStrings("const x = ES_EVERY(10, ES_ANY)", "const x = 10"),
      ]).toEqual(["const x = 10"]);
    });
  });

  describe("ES_SOME", () => {
    it("no options: does not match", () => {
      expect([...findStrings("const x = ES_SOME()", "const x = 10")]).toEqual(
        []
      );
    });
    it("no matching option: does not match", () => {
      expect([
        ...findStrings("const x = ES_SOME(20, 30)", "const x = 10"),
      ]).toEqual([]);
    });
    it("one matching option: does not match", () => {
      expect([
        ...findStrings("const x = ES_SOME(10, 20)", "const x = 10"),
      ]).toEqual(["const x = 10"]);
    });
    it("all matching options: matches", () => {
      expect([
        ...findStrings("const x = ES_SOME(10, ES_ANY)", "const x = 10"),
      ]).toEqual(["const x = 10"]);
    });
  });

  describe("ES_NOT", () => {
    it("matches first argument: does not match", () => {
      expect([...findStrings("const x = ES_NOT(10)", "const x = 10")]).toEqual(
        []
      );
    });
    it("does not match first argument: matches", () => {
      expect([...findStrings("const x = ES_NOT(10)", "const x = 20")]).toEqual([
        "const x = 20",
      ]);
    });
  });
});
