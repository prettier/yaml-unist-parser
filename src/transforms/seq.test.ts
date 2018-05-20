import { getFirstContent, testCases } from "../helpers";
import { Root, Sequence } from "../types";

testCases([
  ["-   ", [getSequence(), getSequenceItem(0)]],
  ["- 123  ", [getSequence(), getSequenceItem(0)]],
  ["- 123  \n- 456  ", [getSequence(), getSequenceItem(0), getSequenceItem(1)]],
]);

function getSequence() {
  return getFirstContent<Sequence>();
}

function getSequenceItem(itemIndex: number) {
  return (root: Root) => getSequence()(root).children[itemIndex];
}
