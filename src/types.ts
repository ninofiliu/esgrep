export type FindOptions = {
  statement: boolean;
  ts: boolean;
  raw: boolean;
};
export type CliOptions = FindOptions & {
  help: boolean;
};
