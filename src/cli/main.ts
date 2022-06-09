import getArgs from "./getArgs";
import { find } from "../lib";
import { CliOptions } from "../types";

function* processFile(
  path: string | number,
  pattern: string,
  content: string,
  cliOptions: CliOptions
) {
  for (const match of find(pattern, content, cliOptions)) {
    yield [
      path,
      match.loc.start.line,
      match.loc.start.column + 1,
      content.slice(match.range[0], match.range[1]),
    ].join(":") + "\n";
  }
}

export default async function* main(
  minimisted: { [key: string]: any; _: string[] },
  readFile: (path: string) => Promise<string>,
  readStdin: () => Promise<string>
) {
  const args = getArgs(minimisted);
  if (args.kind === "error") {
    for (const msg of args.toLog) yield msg;
    return;
  }

  const { cliOptions, pattern, paths } = args;

  if (paths.length === 0) {
    const content = await readStdin();
    for (const chunk of processFile(0, pattern, content, cliOptions)) {
      yield chunk;
    }
  } else {
    for (const path of paths) {
      const content = await readFile(path);
      for (const chunk of processFile(path, pattern, content, cliOptions)) {
        yield chunk;
      }
    }
  }
}
