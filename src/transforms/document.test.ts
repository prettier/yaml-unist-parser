import { testCases, testSyntaxError } from "../helpers";
import { Root } from "../types";

const selectors = [
  getDocument(0),
  getDocument(1),
  getDocumentHead(0),
  getDocumentHead(1),
  getDocumentBody(0),
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
