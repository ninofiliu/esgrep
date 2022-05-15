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

const matches = (object: JsonObject, target: JsonObject) =>
  JSON.stringify(object) === JSON.stringify(target);

function* find(haystack: string, needle: string) {
  const haystackAst = parse(haystack);
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

const found = [
  ...find(
    `const a = 10; const b: number = 20; const c: string = "hello";`,
    `const b: number = 20;`
  ),
];
