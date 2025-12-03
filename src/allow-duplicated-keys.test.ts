import { parse } from "./parse.js";

test("duplicate `<<` keys should always be allowed", () => {
  const text =
    "x:\n  - &a\n    key1: value1\n  - &b\n    key2: value2\nfoo:\n  bar: baz\n  <<: *a\n  <<: *b";
  expect(parse(text)).toMatchSnapshot();
  expect(parse(text, { allowDuplicateKeys: false })).toMatchSnapshot();
  expect(parse(text, { allowDuplicateKeys: true })).toMatchSnapshot();
});

test("duplicate keys should throw error when `allowDuplicateKeys` is false (default)", () => {
  const text = "a: 1\na: 2";
  expect(() => parse(text)).toThrowErrorMatchingSnapshot();
  expect(() =>
    parse(text, { allowDuplicateKeys: false }),
  ).toThrowErrorMatchingSnapshot();
});

test("duplicate keys should be allowed when `allowDuplicateKeys` is true", () => {
  const text = "a: 1\na: 2";
  expect(parse(text, { allowDuplicateKeys: true })).toMatchSnapshot();
});
