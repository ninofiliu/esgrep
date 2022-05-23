#!/usr/bin/env node
import { find } from "./lib";
import { readFile } from "fs/promises";

import getArgs from "./getArgs";
import * as minimist from "minimist";

const args = getArgs(minimist(process.argv.slice(2)));
if (args.kind === "error") {
  for (const msg of args.toLog) console.log(msg);
  process.exit(1);
}

const { cliOptions, pattern, paths } = args;

const processFile = (path: string | number, content: string) => {
  for (const match of find(pattern, content, cliOptions)) {
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
