import { getFirstContent, testCases } from "../helpers.ts";
import { type QuoteDouble } from "../types.ts";

testCases([['   "123 "  ', getFirstContent()]]);
testCases([
  [
    ' !!str # comment 1 \n &anchor # comment 2 \n  "123"   ',
    [
      getFirstContent(),
      root => getFirstContent<QuoteDouble>(root).middleComments[0],
      root => getFirstContent<QuoteDouble>(root).middleComments[1],
    ],
  ],
]);
