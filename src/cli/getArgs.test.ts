import getArgs, { usage } from "./getArgs";

describe("getArgs", () => {
  describe("empty argv", () => {
    it("should fail and log error", () => {
      expect(getArgs({ _: [] })).toEqual({ kind: "error", toLog: [usage] });
    });
  });
  describe("-h", () => {
    it("should fail and log error", () => {
      expect(getArgs({ _: [], h: true })).toEqual({
        kind: "error",
        toLog: [usage],
      });
    });
  });
  describe("--help", () => {
    it("should fail and log error", () => {
      expect(getArgs({ _: [], help: true })).toEqual({
        kind: "error",
        toLog: [usage],
      });
    });
  });
  describe("valid options but no pattern", () => {
    it("should fail and log error", () => {
      expect(getArgs({ _: [], statement: true })).toEqual({
        kind: "error",
        toLog: [
          "Invalid usage: pattern is required. You might fix this by adding -- before your positional arguments. I understood you passed the options:",
          { statement: true },
        ],
      });
    });
  });
  describe("unknown option", () => {
    it("should fail and log why", () => {
      expect(getArgs({ _: ["Neenee the pattern"], makeCoffee: true })).toEqual({
        kind: "error",
        toLog: [
          "ESGrep command line options did not pass validation. You passed:",
          { makeCoffee: true },
          "But this is invalid because data must NOT have additional properties. Use --help for an options overview or check the online docs for more.",
        ],
      });
    });
  });
  describe("invalid option", () => {
    it("should fail and log why", () => {
      expect(
        getArgs({
          _: ["Neenee the pattern"],
          statement: "Слава Україні!",
        })
      ).toEqual({
        kind: "error",
        toLog: [
          "ESGrep command line options did not pass validation. You passed:",
          { statement: "Слава Україні!" },
          "But this is invalid because data/statement must be boolean. Use --help for an options overview or check the online docs for more.",
        ],
      });
    });
  });
  describe("valid options and positional arguments", () => {
    it("should parse and pass them", () => {
      expect(
        getArgs({
          _: [
            "Neenee the pattern",
            "Pablo the first path",
            "Pablito the second path",
          ],
          statement: true,
        })
      ).toEqual({
        cliOptions: { statement: true },
        kind: "success",
        pattern: "Neenee the pattern",
        paths: ["Pablo the first path", "Pablito the second path"],
      });
    });
  });
});
