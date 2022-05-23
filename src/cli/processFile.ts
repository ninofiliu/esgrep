import { find } from "../lib";
import { CliOptions } from "../types";

export default function* processFile(
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
