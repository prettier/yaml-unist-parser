import { getFirstContent, testCases, testSyntaxError } from "../helpers";
import { Sequence } from "../types";

testCases([
  [
    "- &123 hi\n- *123  ",
    x => getFirstContent<Sequence>(x).children[1].children[0]!,
  ],
]);
testSyntaxError("- &123 hi\n- !!tag &anchor *123  ");
