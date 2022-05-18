import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { parse } from "@typescript-eslint/typescript-estree";

type FindOptions = {
  expressionOnly: boolean;
};

const isNode = (value: unknown): value is Node =>
  value !== null && typeof value === "object" && "type" in value;

function* dfs(obj: unknown): Generator<Node> {
  if (typeof obj !== "object") return;
  if (obj === null) return;
  let children: unknown[];
  if (Array.isArray(obj)) {
    children = obj;
  } else {
    if (isNode(obj)) yield obj;
    children = Object.values(obj);
  }
  for (const child of children) {
    yield* dfs(child);
  }
}

const matches = (value: unknown, target: unknown) => {
  if (value === null || typeof value !== "object") return value === target;
  if (target === null || typeof target !== "object") return false;

  if (Array.isArray(value)) {
    if (!Array.isArray(target)) return false;
    return (
      value.length === target.length &&
      value.every((item, i) => matches(item, target[i]))
    );
  } else {
    if (Array.isArray(target)) return false;
    const keys = new Set([...Object.keys(value), ...Object.keys(target)]);
    keys.delete("range");
    keys.delete("loc");
    return [...keys].every((key) => matches(value[key], target[key]));
  }
};

export function* find(
  needle: string,
  haystack: string,
  options: Partial<FindOptions> = {}
) {
  const fullOptions: FindOptions = {
    expressionOnly: true,
    ...options,
  };

  const needleAst = parse(needle);
  if (needleAst.body.length !== 1)
    throw new Error("Needle body does not contain exactly one statement");
  const needleStatement = needleAst.body[0];
  const target =
    fullOptions.expressionOnly && needleStatement.type === "ExpressionStatement"
      ? needleStatement.expression
      : needleStatement;

  const haystackAst = parse(haystack, { loc: true, range: true });

  for (const walked of dfs(haystackAst.body)) {
    if (matches(walked, target)) {
      yield walked;
    }
  }
}

export function* findStrings(
  needle: string,
  haystack: string,
  options: Partial<FindOptions> = {}
) {
  for (const found of find(needle, haystack, options)) {
    yield haystack.slice(found.range[0], found.range[1]);
  }
}
