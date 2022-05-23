#!/usr/bin/env node
import { readFile } from "fs/promises";

import getArgs from "./getArgs";
import * as minimist from "minimist";
import processFile from "./processFile";

const args = getArgs(minimist(process.argv.slice(2)));
if (args.kind === "error") {
  for (const msg of args.toLog) console.log(msg);
  process.exit(1);
}

const { cliOptions, pattern, paths } = args;

(async () => {
  if (paths.length === 0) {
    const chunks = [];
    // @ts-ignore
    for await (const chunk of process.stdin) chunks.push(chunk);
    const content = Buffer.concat(chunks).toString("utf8");
    for (const chunk of processFile(0, pattern, content, cliOptions))
      process.stdout.write(chunk);
  } else {
    for (const path of paths) {
      const content = await readFile(path, "utf8");
      for (const chunk of processFile(path, pattern, content, cliOptions))
        process.stdout.write(chunk);
    }
  }
})();
