import { getFirstContent, testCases } from "../helpers.js";
import { Root, Sequence } from "../types.js";

testCases([
  ["-   ", [getSequence(), getSequenceItem(0)]],
  ["- 123  ", [getSequence(), getSequenceItem(0)]],
  ["- 123  \n- 456  ", [getSequence(), getSequenceItem(0), getSequenceItem(1)]],
  [
    "  !!set #comment1\n\n&anchor    #comment2   \n- 123  \n- 456  ",
    [
      getSequence(),
      root => getFirstContent<Sequence>(root).middleComments[0],
      root => getFirstContent<Sequence>(root).middleComments[1],
    ],
  ],
]);

function getSequence() {
  return getFirstContent<Sequence>();
}

function getSequenceItem(itemIndex: number) {
  return (root: Root) => getSequence()(root).children[itemIndex];
}
