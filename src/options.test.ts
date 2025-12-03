import { parse } from "./parse.js";

for (const { type, text } of [
  { type: "mapping", text: "a: 1\na: 2" },
  { type: "flowMapping", text: `{"a":1,"a":2}` },
  { type: "flowMapping", text: `{"a":1,'a':2}` },
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
