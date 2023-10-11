import { readFile } from "fs/promises";
import minimist from "minimist";

import main from "./main";

(async () => {
  const chunks = main(
    minimist(process.argv.slice(2)),
    (path) => readFile(path, "utf8"),
    async () => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      const content = Buffer.concat(chunks).toString("utf8");
      return content;
    }
  );
  for await (const chunk of chunks) process.stdout.write(chunk);
})();
