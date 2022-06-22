import getArgs from "./getArgs";
import { find } from "../lib";
import { Minimisted } from "../types";
import chalk from "chalk";
import { highlight } from "cli-highlight";

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
    if (cliOptions.format === "count") {
      const count = [...find(pattern, content, cliOptions)].length;
      yield `${path}:${count}\n`;
    } else {
      const highlightedContent =
        cliOptions.format === "pretty" ? highlight(content) : "";
      for (const match of find(pattern, content, cliOptions)) {
        if (cliOptions.format === "pretty") {
          const clickablePath = [
            path,
            match.loc.start.line,
            match.loc.start.column,
          ].join(":");
          const lineNbWidth = match.loc.end.line.toString().length;
          yield [
            chalk.blue(Array(clickablePath.length + 2).join("─") + "┐"),
            chalk.blue(`${clickablePath} │`),
            chalk.blue(
              `${Array(lineNbWidth + 2).join(" ")}┌${Array(
                clickablePath.length - lineNbWidth
              ).join("─")}┘`
            ),
            ...highlightedContent
              .split("\n")
              .slice(match.loc.start.line - 1, match.loc.end.line)
              .map(
                (line, i) =>
                  `${chalk.blue(
                    `${(match.loc.start.line + i)
                      .toString()
                      .padStart(lineNbWidth, " ")} │`
                  )} ${line}`
              ),
            "",
          ].join("\n");
        }
        if (cliOptions.format === "oneline") {
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
}
