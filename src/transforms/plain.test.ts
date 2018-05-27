import { getFirstContent, testCases } from "../helpers";
import { Plain } from "../types";

testCases([
  ["   123   ", getFirstContent()],
  [
    "# comment\n&anchor !<tag> 123",
    [
      getFirstContent(),
      root => getFirstContent<Plain>(root).tag,
      root => getFirstContent<Plain>(root).anchor,
      root => root.comments,
    ],
  ],
]);
testCases([
  [
    " !!str # comment 1 \n &anchor # comment 2 \n  123   ",
    [
      getFirstContent(),
      root => getFirstContent<Plain>(root).middleComments[0],
      root => getFirstContent<Plain>(root).middleComments[1],
    ],
  ],
]);
