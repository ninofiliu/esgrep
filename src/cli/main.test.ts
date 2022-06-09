import { Minimisted } from "../types";
import main from "./main";

const usersHaystack = `const getUserByName = async (name: string) => {
  const resp = await fetch("/users");
  const allUsers = await resp.json();
  return allUsers.find((user) => user.name === name);
};
const getUsersByGroup = async (group: number) => {
  const resp = await fetch("/users");
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

describe("--format jsonl", () => {
  it("{ $path, $match }", async () => {
    expect(
      await wrappedMain({
        _: ["user", "users.ts", "age.ts"],
        format: "jsonl",
      })
    ).toEqual(
      '{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[148,152],"loc":{"start":{"line":4,"column":24},"end":{"line":4,"column":28}}}}\n{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[157,161],"loc":{"start":{"line":4,"column":33},"end":{"line":4,"column":37}}}}\n{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[334,338],"loc":{"start":{"line":9,"column":26},"end":{"line":9,"column":30}}}}\n{"path":"users.ts","match":{"type":"Identifier","name":"user","range":[343,347],"loc":{"start":{"line":9,"column":35},"end":{"line":9,"column":39}}}}\n'
    );
  });
});
