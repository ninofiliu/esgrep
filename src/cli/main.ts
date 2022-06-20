import getArgs from "./getArgs";
import { find } from "../lib";
import { Minimisted } from "../types";

export default async function* main(
  minimisted: Minimisted,
  readFile: (path: string) => Promise<string>,
  readStdin: () => Promise<string>
): AsyncGenerator<string, void, unknown> {
  const args = getArgs(minimisted);
  if (args.kind === "error") {
    for (const msg of args.toLog) yield msg;
    return;
  }

  const { cliOptions, pattern, paths } = args;

  const tasks =
    paths.length === 0
      ? [{ path: "stdin", read: readStdin }]
      : paths.map((path) => ({ path, read: () => readFile(path) }));

  for (const { path, read } of tasks) {
    const content = await read();
    for (const match of find(pattern, content, cliOptions)) {
      if (cliOptions.format === "pretty") {
        yield [
          [path, match.loc.start.line, match.loc.start.column].join(":"),
          ...content
            .split("\n")
            .slice(match.loc.start.line - 1, match.loc.end.line)
            .map((line, i) => `${match.loc.start.line + i} | ${line}`),
          "",
        ].join("\n");
      }
      if (cliOptions.format === "compact") {
        yield [
          path,
          match.loc.start.line,
          match.loc.start.column,
          content
            .substring(match.range[0], match.range[1])
            .replace(/\s+/g, " "),
        ].join(":") + "\n";
      }
      if (cliOptions.format === "jsonl") {
        yield JSON.stringify({ path, match }) + "\n";
      }
    }
  }
}
