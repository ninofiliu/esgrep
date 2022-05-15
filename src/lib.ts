import { parse } from "@typescript-eslint/typescript-estree";

type JsonObject = { [key: string]: Json };
type Json = null | boolean | number | string | Json[] | JsonObject;

function* dfs(obj: Json): Generator<JsonObject> {
  if (typeof obj !== "object") return;
  if (obj === null) return;
  let children: Json[];
  if (Array.isArray(obj)) {
    children = obj;
  } else {
    yield obj;
    children = Object.values(obj);
  }
  for (const child of children) {
    yield* dfs(child);
  }
}

const matches = (value: Json, target: Json) => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  )
    return value === target;
  if (Array.isArray(value)) {
    return (
      Array.isArray(target) &&
      value.length === target.length &&
      value.every((aa, i) => matches(aa, target[i]))
    );
  } else {
    return (
      target !== null &&
      typeof target === "object" &&
      !Array.isArray(target) &&
      objectMatches(value, target)
    );
  }
};

const objectMatches = (value: JsonObject, target: JsonObject) => {
  const keys = new Set([...Object.keys(value), ...Object.keys(target)]);
  keys.delete("loc");
  keys.delete("range");
  return [...keys].every((key) => matches(value[key], target[key]));
};

export function* find(haystack: string, needle: string) {
  const haystackAst = parse(haystack, { loc: true, range: true });
  const needleAst = parse(needle);
  if (needleAst.body.length !== 1)
    throw new Error("Needle body does not contain exactly one statement");

  // @ts-ignore A ProgramStatement[] is a Json
  const body = haystackAst.body as Json;
  // @ts-ignore A Statement is a Json
  const target = needleAst.body[0] as JsonObject;

  for (const walked of dfs(body)) {
    if (matches(walked, target)) {
      yield walked;
    }
  }
}
