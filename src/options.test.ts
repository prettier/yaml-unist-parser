import { parse } from "./parse.js";

for (const { type, text } of [
  { type: "mapping", text: "<<: 1\n<<: 2" },
  { type: "flowMapping", text: '{"<<": 1,"<<": 2}' },
]) {
  test(`(${type}): duplicate '<<' keys should always be allowed`, () => {
    expect(parse(text)).toBeDefined();
    expect(parse(text, { allowDuplicateKeysInMap: false })).toBeDefined();
    const ast = parse(text, { allowDuplicateKeysInMap: true });
    expect(ast).toBeDefined();
    const node = ast.children[0].children[1].children[0];
    expect(node?.type).toBe(type);
  });
}

for (const { type, text } of [
  { type: "mapping", text: "a: 1\na: 2" },
  { type: "flowMapping", text: `{"a":1,"a":2}` },
]) {
  test(`(${type}): duplicate keys in ${text}`, () => {
    expect(() => parse(text)).toThrowError(
      `Map keys must be unique; "a" is repeated`,
    );
    expect(() => parse(text, { allowDuplicateKeysInMap: false })).toThrowError(
      `Map keys must be unique; "a" is repeated`,
    );
    const ast = parse(text, { allowDuplicateKeysInMap: true });
    expect(ast).toBeDefined();
    const node = ast.children[0].children[1].children[0];
    expect(node?.type).toBe(type);
  });
}
