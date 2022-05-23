import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { parse } from "@typescript-eslint/typescript-estree";
import { FindOptions } from "./types";

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
  pattern: string,
  haystack: string,
  options: Partial<FindOptions> = {}
) {
  const fullOptions: FindOptions = {
    statement: false,
    ...options,
  };

  const patternAst = parse(pattern);
  if (patternAst.body.length !== 1)
    throw new Error("Pattern body does not contain exactly one statement");
  const patternStatement = patternAst.body[0];
  const target =
    !fullOptions.statement && patternStatement.type === "ExpressionStatement"
      ? patternStatement.expression
      : patternStatement;

  const haystackAst = parse(haystack, { loc: true, range: true });

  for (const walked of dfs(haystackAst.body)) {
    if (matches(walked, target)) {
      yield walked;
    }
  }
}

export function* findStrings(
  pattern: string,
  haystack: string,
  options: Partial<FindOptions> = {}
) {
  for (const found of find(pattern, haystack, options)) {
    yield haystack.slice(found.range[0], found.range[1]);
  }
}
