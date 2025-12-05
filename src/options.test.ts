import { parse } from "./parse.ts";

// `<<` is a special key in YAML 1.1
// https://github.com/eemeli/yaml/blob/main/src/schema/yaml-1.1/merge.ts
test(`duplicate '<<' keys should always be allowed`, () => {
  const text = "<<: 1\n<<: 2";
  expect(parse(text)).toBeDefined();
  expect(parse(text, { uniqueKeys: false })).toBeDefined();
  const ast = parse(text, { uniqueKeys: true });
  expect(ast).toBeDefined();
  const node = ast.children[0].children[1].children[0];
  expect(node?.type).toBe("mapping");
});

for (const { type, text } of [
  { type: "mapping", text: "a: 1\na: 2" },
  { type: "flowMapping", text: `{"a":1,"a":2}` },
  { type: "flowMapping", text: `{"a":1,'a':2}` },
  { type: "flowMapping", text: `{"<<":1,"<<":2}` },
]) {
  test(`(${type}): duplicate keys in ${text}`, () => {
    expect(() => parse(text)).toThrowError(`Map keys must be unique`);
    expect(() => parse(text, { uniqueKeys: true })).toThrowError(
      `Map keys must be unique`,
    );
    const ast = parse(text, { uniqueKeys: false });
    expect(ast).toBeDefined();
    const node = ast.children[0].children[1].children[0];
    expect(node?.type).toBe(type);
  });
}
