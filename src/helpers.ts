import { parse } from "./parse";
import {
  CommentAttachable,
  Node,
  Position,
  Root,
  YamlUnistNode,
} from "./types";

const RAW = Symbol("raw");

expect.addSnapshotSerializer({
  test: value => typeof value[RAW] === "string",
  print: value => value[RAW].replace(/ +$/gm, ""),
});

export type TestCase = TestCaseSingle | TestCaseMulti;
export type TestCaseSelector = (root: Root) => YamlUnistNode | Node;

export type TestCaseSingle = [string, TestCaseSelector];
export type TestCaseMulti = [string, TestCaseSelector[]];

export function getFirstContent<T extends YamlUnistNode>(): (root: Root) => T;
export function getFirstContent<T extends YamlUnistNode>(root: Root): T;
export function getFirstContent<T extends YamlUnistNode>(root?: Root) {
  return !root
    ? (_root: Root) => _root.children[0].children[1].children[0] as T
    : (root.children[0].children[1].children[0] as T);
}

export function testCases(cases: TestCase[]) {
  cases.forEach(testCase => {
    const [text, selector] = testCase;
    const selectNodes = ([] as TestCaseSelector[]).concat(selector);
    selectNodes.forEach(selectNode => {
      test(`${JSON.stringify(text)}`, () => {
        expect({ [RAW]: snapshotNode(text, selectNode) }).toMatchSnapshot();
      });
    });
  });
}

function snapshotNode(
  text: string,
  selectNode: (root: Root) => YamlUnistNode | Node,
) {
  const root = parse(text);
  const node = selectNode(root);
  return (
    `${node.type} (` +
    `${node.position.start.line}:${node.position.start.column} ~ ` +
    `${node.position.end.line}:${node.position.end.column}` +
    ")\n" +
    codeFrameColumns(text, node.position) +
    "\n" +
    stringifyNode(node)
  );
}

function stringifyNode(node: YamlUnistNode | Node): string {
  const attributes = Object.keys(node)
    .filter(key => {
      switch (key) {
        case "type":
        case "position":
        case "children":
        case "leadingComments":
        case "middleComments":
        case "trailingComments":
          return false;
        default:
          return true;
      }
    })
    .map(key => `${key}=${JSON.stringify(node[key as keyof typeof node])}`)
    .sort()
    .map((attribute, index) => (index === 0 ? " " + attribute : attribute))
    .join(" ");
  const comments =
    "leadingComments" in node
      ? (["leadingComments", "middleComments", "trailingComments"] as Array<
          keyof CommentAttachable
        >)
          .map(key =>
            node[key].map(
              comment =>
                `<${key.slice(0, -1)} value=${JSON.stringify(comment.value)}>`,
            ),
          )
          .reduce((a, b) => a.concat(b), [])
      : [];
  return "children" in node || comments.length !== 0
    ? `<${node.type}${attributes}>\n${indent(
        comments
          .concat(
            "children" in node
              ? (node.children as YamlUnistNode[]).map(stringifyNode)
              : [],
          )
          .join("\n"),
      )}\n</${node.type}>`
    : `<${node.type}${attributes} />`;
}

function indent(text: string) {
  return text
    .split("\n")
    .map(line => "  " + line)
    .join("\n");
}

function codeFrameColumns(text: string, position: Position) {
  const lines = text.split("\n").map(line => `${line}¶`);
  const markerLines = lines.map((line, index) => {
    if (index < position.start.line - 1 || index > position.end.line - 1) {
      return "";
    }
    if (index === position.start.line - 1) {
      return (
        " ".repeat(position.start.column - 1) +
        (index === position.end.line - 1 &&
        position.start.column === position.end.column
          ? "~"
          : "^".repeat(
              (index === position.end.line - 1
                ? position.end.column - 1
                : line.length) -
                (position.start.column - 1),
            ))
      );
    } else if (index === position.end.line - 1) {
      return position.end.column === 1 && line === "¶"
        ? "^"
        : "^".repeat(position.end.column - 1);
    } else {
      return "^".repeat(line.length);
    }
  });

  const gutterWidth = Math.floor(Math.log10(lines.length)) + 1;

  return lines
    .reduce(
      (reduced, line, index) => {
        const gutter = leftpad(`${index + 1}`, gutterWidth);
        return reduced.concat(
          `${gutter} | ${line.replace(/ /g, "·")}`,
          markerLines[index]
            ? `${" ".repeat(gutterWidth)} | ${markerLines[index]}`
            : [],
        );
      },
      [] as string[],
    )
    .join("\n");
}

function leftpad(text: string, width: number) {
  return " ".repeat(Math.max(0, width - text.length)) + text;
}
