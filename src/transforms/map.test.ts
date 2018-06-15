import {
  getFirstContent,
  TestCase,
  testCases,
  testSyntaxError,
} from "../helpers";
import { Mapping, Root } from "../types";

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
