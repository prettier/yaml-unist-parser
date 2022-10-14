import { getFirstContent, testCases } from "../helpers.js";
import { QuoteSingle } from "../types.js";

testCases([["   '123 '  ", getFirstContent()]]);
testCases([
  [
    " !!str # comment 1 \n &anchor # comment 2 \n  '123'   ",
    [
      getFirstContent(),
      root => getFirstContent<QuoteSingle>(root).middleComments[0],
      root => getFirstContent<QuoteSingle>(root).middleComments[1],
    ],
  ],
]);
