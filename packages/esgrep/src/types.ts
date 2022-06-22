export type FindOptions = {
  statement: boolean;
  ts: boolean;
  raw: boolean;
};
export type CliOptions = FindOptions & {
  help: boolean;
  format: "pretty" | "oneline" | "jsonl" | "count";
};
export type Minimisted = { _: string[]; [key: string]: any };
