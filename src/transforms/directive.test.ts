import { testCases } from "../helpers";

testCases([
  ["%TEST aaa bbb\n---\n", root => root.children[0].children[0].children[0]],
]);
