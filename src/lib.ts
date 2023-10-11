// @ts-ignore
import type { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { parse } from "@typescript-eslint/typescript-estree";

import type { FindOptions } from "./types";

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

const uniformizeTemplate = (value: Record<string, unknown>) => {
  if (!isNode(value)) return value;
  if (value.type !== "TemplateLiteral") return value;

  // @ts-ignore
  if (value.quasis.length > 1) return value;

  // @ts-ignore
  return { type: "Literal", value: value.quasis[0].value.cooked };
};

const matches = (value: unknown, target: unknown, options: FindOptions) => {
  if (value === null || typeof value !== "object") return value === target;
  if (target === null || typeof target !== "object") return false;

  if (Array.isArray(value)) {
    if (!Array.isArray(target)) return false;
    return (
      value.length === target.length &&
      value.every((item, i) => matches(item, target[i], options))
    );
  } else {
    if (Array.isArray(target)) return false;
    let cValue = value as any;
    let cTarget = target as any;
    if (!options.raw) {
      cValue = uniformizeTemplate(cValue);
      cTarget = uniformizeTemplate(cTarget);
    }

    const keys = new Set([...Object.keys(cValue), ...Object.keys(cTarget)]);
    if (isNode(cValue)) {
      if (!isNode(cTarget)) return false;
      if (!options.raw) {
        keys.delete("raw");
      }
      keys.delete("range");
      keys.delete("loc");
      if (!options.ts) {
        keys.delete("typeAnnotation");
      }

      if (cValue.type === "Identifier" && cValue.name === "ES_ANY") return true;
      if (
        cValue.type === "CallExpression" &&
        cValue.callee.type === "Identifier"
      ) {
        switch (cValue.callee.name) {
          case "ES_EVERY":
            return cValue.arguments.every((child) =>
              matches(child, cTarget, options)
            );
          case "ES_SOME":
            return cValue.arguments.some((child) =>
              matches(child, cTarget, options)
            );
          case "ES_NOT":
            return !matches(cValue.arguments[0], cTarget, options);
        }
      }
    }
    return [...keys].every((key) =>
      matches(cValue[key], cTarget[key], options)
    );
  }
};

export function* find(
  pattern: string,
  haystack: string,
  options: Partial<FindOptions> = {}
) {
  const fullOptions: FindOptions = {
    statement: false,
    ts: false,
    raw: false,
    ...options,
  };

  const patternAst = parse(pattern);
  if (patternAst.body.length !== 1)
    throw new Error("Pattern body does not contain exactly one statement");
  const patternStatement = patternAst.body[0];
  const value =
    !fullOptions.statement && patternStatement.type === "ExpressionStatement"
      ? patternStatement.expression
      : patternStatement;

  const haystackAst = parse(haystack, { loc: true, range: true });

  for (const target of dfs(haystackAst.body)) {
    if (matches(value, target, fullOptions)) {
      yield target;
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
