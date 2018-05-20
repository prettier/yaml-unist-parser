import { getFirstContent, testCases } from "../helpers";
import { FlowSequence, Root } from "../types";

const selectors = [getFlowSequence(), getFlowSequenceItem(0)];

testCases([
  ["  [ , ]  ", selectors],
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
  ["  [ 123,, ]  ", selectors],
]);

function getFlowSequence() {
  return getFirstContent<FlowSequence>();
}

function getFlowSequenceItem(itemIndex: number) {
  return (root: Root) => getFlowSequence()(root).children[itemIndex];
}
