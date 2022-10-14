import { testCases, testSyntaxError } from "../helpers.js";
import { Root } from "../types.js";

const selectors = [
  getDocument(0),
  getDocumentHead(0),
  getDocumentBody(0),
  getDocument(1),
  getDocumentHead(1),
  getDocumentBody(1),
];

testSyntaxError(`- 123\na:\n`);

testCases([
  ["\n123\n\n---\n\n456\n\n", selectors],
  ["\n123\n\n...\n\n456\n\n", selectors],
  ["\n%AAA\n---\n123\n\n...\n\n456\n\n", selectors],
  ["\n%AAA\n---\n123\n\n---\n\n456\n\n", selectors],
  ["\n%AAA\n---\n123\n\n...\n\n---\n\n456\n\n", selectors],
  ["\n%AAA\n---\n123\n\n...\n\n%BBB\n---\n\n456\n\n", selectors],
  ["- AAA\n# comment\n---\n- BBB", selectors],
  ["---\nhello\n... #documentEndComment\n", getDocument(0)],
  ['&123 123 "123"\n\n... #123\n #\n\n123\n\n\n ', selectors],
  ["...\n\n#\n\n", selectors],
  ["#123\n#456\n---", getDocumentHead(0)],
  ["123\n--- #666\n456", root => root],
  ["123\n...\n456", [getDocument(0), getDocumentBody(0)]],
]);

function getDocument(documentIndex: number) {
  return (root: Root) => root.children[documentIndex];
}

function getDocumentHead(documentIndex: number) {
  return (root: Root) => getDocument(documentIndex)(root).children[0];
}

function getDocumentBody(documentIndex: number) {
  return (root: Root) => getDocument(documentIndex)(root).children[1];
}
