import { getFirstContent, testCases } from "../helpers";
import { FlowSequence, Root } from "../types";

const selectors = [getFlowSequence(), getFlowSequenceItem(0)];

testCases([
  // ["  [ , ]  ", selectors], // TODO
  ["  [ ? ]  ", selectors],
  ["  [ : ]  ", selectors],
  ["  [ ? : ]  ", selectors],
  ["  [ 123 ]  ", selectors],
  ["  [ ? : 123 ]  ", selectors],
  ["  [ ? 123 : ]  ", selectors],
  ["  [ ? 123 : 456 ]  ", selectors],
  ["  [ ? 123 ]  ", selectors],
  ["  [ 123 : ]  ", selectors],
  ["  [ : 123 ]  ", selectors],
  ["  [ 123 : 456 ]  ", selectors],
  ["  [ 123, ]  ", selectors],
  // ["  [ 123,, ]  ", selectors], // TODO
  ["  [ 123, #123\n ]  ", selectors],
  [
    "  !!map\n #123 \n&anchor # 456 \n []  ",
    [
      getFlowSequence(),
      root => getFirstContent<FlowSequence>(root).middleComments[0],
      root => getFirstContent<FlowSequence>(root).middleComments[1],
    ],
  ],
]);

function getFlowSequence() {
  return getFirstContent<FlowSequence>();
}

function getFlowSequenceItem(itemIndex: number) {
  return (root: Root) => getFlowSequence()(root).children[itemIndex];
}
