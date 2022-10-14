import {
  getFirstContent,
  TestCase,
  testCases,
  testSyntaxError,
} from "../helpers.js";
import { Mapping, Root, Sequence } from "../types.js";

testSyntaxError("asd: 123\nqwe\n");

testCases([
  ...createTestCases(":   "),
  ...createTestCases(": 123  "),
  ...createTestCases("a:   "),
  ...createTestCases("a: 123  "),
  ...createTestCases("a: 123  \nb: 456  ", true),
  ...createTestCases("? a  \n: 123  \n? b  \n: 456  ", true),
  ...createTestCases("? abc\n? def", true),
  ...createTestCases("? 123"),
  ...createTestCases("def:     456 # hello"),
  [
    "!!map\n #123 \n&anchor # 456\na: 123",
    [
      getMapping(),
      root => getFirstContent<Mapping>(root).middleComments[0],
      root => getFirstContent<Mapping>(root).middleComments[1],
    ],
  ],
  [
    "x:\n  - &a\n    key1: value1\n  - &b\n    key2: value2\nfoo:\n  bar: baz\n  <<: *a\n  <<: *b",
    getMappingItem(1),
  ],
  [
    "merge:\n- &A { a: 1 }\n- &B { b: 2 }\n- <<: [ *A, *B ]",
    root => (getMappingValue(0)(root).children[0] as Sequence).children[2],
  ],
  ["a:\n  b:\n   #b\n #a\n", getFirstContent()],
  ["a: !!str", getFirstContent()],
  ["<<:\n  a: b", getFirstContent()],
]);

function createTestCases(text: string, hasSecondItem = false): TestCase[] {
  return !hasSecondItem
    ? [
        [text, getMapping()],
        [text, getMappingItem(0)],
        [text, getMappingKey(0)],
        [text, getMappingValue(0)],
      ]
    : [
        [text, getMapping()],
        [text, getMappingItem(0)],
        [text, getMappingItem(1)],
        [text, getMappingKey(0)],
        [text, getMappingKey(1)],
        [text, getMappingValue(0)],
        [text, getMappingValue(1)],
      ];
}

function getMapping() {
  return getFirstContent<Mapping>();
}

function getMappingItem(itemIndex: number) {
  return (root: Root) => getMapping()(root).children[itemIndex];
}

function getMappingKey(itemIndex: number) {
  return (root: Root) => getMappingItem(itemIndex)(root).children[0];
}

function getMappingValue(itemIndex: number) {
  return (root: Root) => getMappingItem(itemIndex)(root).children[1];
}
