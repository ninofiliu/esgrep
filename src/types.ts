export type FindOptions = {
  statement: boolean;
};
export type CliOptions = FindOptions & {
  help: boolean;
};
export const partialCliOptionsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    statement: {
      type: "boolean",
      description:
        "If the needle is an expression statement, lookup the statement itself, and not the expression",
    },
    help: {
      type: "boolean",
      description: "Prints help and exit",
    },
  },
} as const;
