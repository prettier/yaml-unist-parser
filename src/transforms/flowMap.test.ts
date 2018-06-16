import { getFirstContent, testCases } from "../helpers";
import { FlowMapping, Root } from "../types";

const selectors = [
  getFlowMapping(),
  getFlowMappingItem(0),
  getFlowMappingKey(0),
  getFlowMappingValue(0),
];

testCases([
  ["  { ? }  ", selectors],
  ["  { : }  ", selectors],
  ["  { ? : }  ", selectors],
  ["  { 123 }  ", selectors],
  ["  { ? : 123 }  ", selectors],
  ["  { ? 123 : }  ", selectors],
  ["  { ? 123 : 456 }  ", selectors],
  ["  { ? 123 }  ", selectors],
  ["  { 123 : }  ", selectors],
  ["  { : 123 }  ", selectors],
  ["  { 123 : 456 }  ", selectors],
  ["  { 123, }  ", selectors],
  ["  { 123, #123\n }  ", selectors],
  [
    "  !!map\n #123 \n&anchor # 456 \n {}  ",
    [
      getFlowMapping(),
      root => getFirstContent<FlowMapping>(root).middleComments[0],
      root => getFirstContent<FlowMapping>(root).middleComments[1],
    ],
  ],
]);

function getFlowMapping() {
  return getFirstContent<FlowMapping>();
}

function getFlowMappingItem(itemIndex: number) {
  return (root: Root) => getFlowMapping()(root).children[itemIndex];
}

function getFlowMappingKey(itemIndex: number) {
  return (root: Root) => getFlowMappingItem(itemIndex)(root).children[0];
}

function getFlowMappingValue(itemIndex: number) {
  return (root: Root) => getFlowMappingItem(itemIndex)(root).children[1];
}
