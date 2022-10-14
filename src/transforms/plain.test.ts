import { getFirstContent, testCases } from "../helpers.js";
import { Mapping, MappingValue, Plain } from "../types.js";

testCases([
  ["   123   ", getFirstContent()],
  [" ! 12  ", root => getFirstContent<Plain>(root).tag!],
  [
    "# comment\n&anchor !<tag> 123",
    [
      getFirstContent(),
      root => getFirstContent<Plain>(root).tag!,
      root => getFirstContent<Plain>(root).anchor!,
      root => root.comments,
    ],
  ],
  [
    "a: b\n c",
    root =>
      (getFirstContent<Mapping>(root).children[0].children[1] as MappingValue)
        .children[0]!,
  ],
  [
    " !!str # comment 1 \n &anchor # comment 2 \n  123   ",
    [
      getFirstContent(),
      root => getFirstContent<Plain>(root).middleComments[0],
      root => getFirstContent<Plain>(root).middleComments[1],
    ],
  ],
]);
