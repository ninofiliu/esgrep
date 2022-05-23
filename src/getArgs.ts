import Ajv from "ajv";
import { CliOptions, partialCliOptionsSchema } from "./types";

type Args =
  | { kind: "error"; toLog: any[] }
  | {
      kind: "success";
      cliOptions: CliOptions;
      pattern: string;
      paths: string[];
    };

const aliases = {
  s: "statement",
  h: "help",
} as const;

const reversedAliases = {
  statement: "s",
  help: "h",
} as const;

export const usage = `ESGrep - Syntactically-aware grep for JavaScript and TypeScript

Usage: esgrep [OPTION...] PATTERN [FILE...]

Positional arguments:
  PATTERN: Javascript or typescript statement to match
  FILE: Path to files to lookup the files in. If none is specified, read from stdin
        
Options:
${Object.entries(partialCliOptionsSchema.properties)
  .map(
    ([option, { description }]) =>
      `  -${reversedAliases[option]}, --${option}: ${description}`
  )
  .join("\n")}`;

const docText =
  "Use --help for an options overview or check the online docs for more.";

export default (minimisted: { _: string[]; [key: string]: any }): Args => {
  const {
    _: [pattern, ...paths],
    ...options
  } = minimisted;

  const dealiasedOptions = Object.fromEntries(
    Object.entries(options).map(([key, value]) => [aliases[key] || key, value])
  );

  if (dealiasedOptions.help || pattern === undefined) {
    return {
      kind: "error",
      toLog: [usage],
    };
  }

  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(partialCliOptionsSchema, dealiasedOptions);
  if (!valid) {
    return {
      kind: "error",
      toLog: [
        "ESGrep command line options did not pass validation. You passed:",
        dealiasedOptions,
        `But this is invalid because ${ajv.errorsText(ajv.errors)}. ${docText}`,
      ],
    };
  }

  const cliOptions = dealiasedOptions as CliOptions;

  return {
    kind: "success",
    cliOptions,
    pattern,
    paths,
  };
};
