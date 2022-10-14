import { testCases } from "../helpers.js";

testCases([
  ["%TEST aaa bbb\n---\n", root => root.children[0].children[0].children[0]],
]);
