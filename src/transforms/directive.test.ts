import { testCases } from "../helpers.ts";

testCases([
  ["%TEST aaa bbb\n---\n", root => root.children[0].children[0].children[0]],
]);
