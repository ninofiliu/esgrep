#!/usr/bin/env node
import { find } from "./lib";
import { readFile } from "fs/promises";

(async () => {
  const [, , needle, ...paths] = process.argv;
  for (const path of paths) {
    const haystack = await readFile(path, "utf8");
    for (const found of find(haystack, needle)) {
      process.stdout.write(
        [
          path,
          // @ts-ignore
          found.loc.start.line,
          // @ts-ignore
          found.loc.start.column,
          haystack.slice(found.range[0], found.range[1]),
        ].join(":") + "\n"
      );
    }
  }
})();
