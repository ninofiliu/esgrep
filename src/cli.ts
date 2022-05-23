#!/usr/bin/env node
import { find } from "./lib";
import { readFile } from "fs/promises";

import * as minimist from "minimist";
import Ajv from "ajv";
import { CliOptions, partialCliOptionsSchema } from "./types";

const {
  _: [needle, ...paths],
  ...options
} = minimist(process.argv.slice(2));

const aliases = {
  s: "statement",
  h: "help",
} as const;
const reversedAliases = {
  statement: "s",
  help: "h",
} as const;

const validateOptions = (): CliOptions | undefined => {
  const dealiasedOptions = Object.fromEntries(
    Object.entries(options).map(([key, value]) => [aliases[key] || key, value])
  );

  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(partialCliOptionsSchema, dealiasedOptions);
  if (!valid) {
    console.log("ESGrep command line options did not pass validation");
    console.log("You passed the options:", dealiasedOptions);
    console.log(
      "AJV found these validation errors:",
      ajv.errorsText(ajv.errors)
    );
    return;
  }
  return dealiasedOptions as CliOptions;
};

const validOptions = validateOptions();
if (!validOptions) process.exit(1);

const usage = `ESGrep - Syntactically-aware grep for JavaScript and TypeScript

Usage: esgrep [OPTION...] NEEDLE [FILE...]

Positional arguments:
  NEEDLE: Javascript or typescript statement to match
  FILE: Path to files to lookup the files in. If none is specified, read from stdin
        
Options:
${Object.entries(partialCliOptionsSchema.properties)
  .map(
    ([option, { description }]) =>
      `  -${reversedAliases[option]}, --${option}: ${description}`
  )
  .join("\n")}`;

if (validOptions.help) {
  console.log(usage);
  process.exit(1);
}

if (!needle) {
  console.log("NEEDLE positional argument is required");
  process.exit(1);
}

const processFile = (path: string | number, content: string) => {
  for (const match of find(needle, content)) {
    // TODO
    console.log({ path, match });
  }
};

(async () => {
  if (paths.length === 0) {
    const chunks = [];
    // @ts-ignore
    for await (const chunk of process.stdin) chunks.push(chunk);
    const content = Buffer.concat(chunks).toString("utf8");
    processFile(0, content);
  } else {
    for (const path of paths) {
      const content = await readFile(path, "utf8");
      processFile(path, content);
    }
  }
})();
