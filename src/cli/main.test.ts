import { Minimisted } from "../types";
import main from "./main";

const usersHaystack = `const getUserByName = async (name: string) => {
  const resp = await fetch(
    "/users"
  );
  const allUsers = await resp.json();
  return allUsers.find((user) => user.name === name);
};
const getUsersByGroup = async (group: number) => {
  const resp = await fetch(
    "/users"
  );
  const allUsers = await resp.json();
  return allUsers.filter((user) => user.groups.includes(group));
};
`;
const ageHaystack = `const input = document.createElement("input");
input.type = "number";
input.placeholder = "Age?";
input.addEventListener("change", (evt) => {
  console.log(\`User is \${input.value} years old\`);
});
document.body.append(input);
`;

const wrappedMain = async (minimisted: Minimisted) => {
  const chunks = main(
    minimisted,
    (path: "users.ts" | "age.ts") =>
      Promise.resolve(
        { "users.ts": usersHaystack, "age.ts": ageHaystack }[path]
      ),
    () => Promise.resolve("")
  );
  let ret = "";
  for await (const chunk of chunks) ret += chunk;
  return ret;
};

describe("--format pretty (default)", () => {
  it("pretty", async () => {
    expect(
      await wrappedMain({
        _: ['input.addEventListener("change", ES_ANY)', "users.ts", "age.ts"],
      })
    ).toEqual(
      [
        "age.ts:4:0",
        '4 | input.addEventListener("change", (evt) => {',
        "5 |   console.log(`User is ${input.value} years old`);",
        "6 | });",
        "",
      ].join("\n")
    );
  });
});

describe("--format oneline", () => {
  it("$path:$line$column:$match_in_one_line", async () => {
    expect(
      await wrappedMain({
        _: ["fetch(ES_ANY)", "users.ts", "age.ts"],
        format: "oneline",
      })
    ).toEqual(
      [
        'users.ts:2:21:fetch( "/users" )',
        'users.ts:9:21:fetch( "/users" )',
        "",
      ].join("\n")
    );
  });
});

describe("--format jsonl", () => {
  it("{ $path, $match }", async () => {
    expect(
      await wrappedMain({
        _: ["user", "users.ts", "age.ts"],
        format: "jsonl",
      })
    ).toEqual(
      [
        '{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[156,160],"loc":{"start":{"line":6,"column":24},"end":{"line":6,"column":28}}}}',
        '{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[165,169],"loc":{"start":{"line":6,"column":33},"end":{"line":6,"column":37}}}}',
        '{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[350,354],"loc":{"start":{"line":13,"column":26},"end":{"line":13,"column":30}}}}',
        '{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[359,363],"loc":{"start":{"line":13,"column":35},"end":{"line":13,"column":39}}}}',
        "",
      ].join("\n")
    );
  });
});

describe("--format count", () => {
  it("$path,$count", async () => {
    expect(
      await wrappedMain({
        _: ["user", "users.ts", "age.ts"],
        format: "count",
      })
    ).toEqual(["users.ts:4", "age.ts:0", ""].join("\n"));
  });
});
