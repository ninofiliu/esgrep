import chalk from "chalk";
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
    const result = await wrappedMain({
      _: ['input.addEventListener("change", ES_ANY)', "users.ts", "age.ts"],
    });
    expect(Buffer.from(result).toString("base64")).toEqual(
      "G1szNG3ilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAbWzM5bQobWzM0bWFnZS50czo0OjAg4pSCG1szOW0KG1szNG0gIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmBtbMzltChtbMzRtNCDilIIbWzM5bSAbWzM0bWlucHV0G1szOW0uYWRkRXZlbnRMaXN0ZW5lcigiY2hhbmdlIiwgKGV2dCkgPT4gewobWzM0bTUg4pSCG1szOW0gICBjb25zb2xlLmxvZyhgG1szNG1Vc2VyG1szOW0gG1szNG1pcxtbMzltICR7G1szNG1pbnB1dBtbMzltLhtbMzRtdmFsdWUbWzM5bX0geWVhcnMgG1szNm1vbGQbWzM5bWApOwobWzM0bTYg4pSCG1szOW0gfSk7Cg=="
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
