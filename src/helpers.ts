import { wrap } from "jest-snapshot-serializer-raw";
import { parse } from "./parse";
import { Comment, Node, Position, Root, YamlUnistNode } from "./types";
import { isYAMLError } from "./utils";

export type Arrayable<T> = T | T[];

export type TestCase = TestCaseSingle | TestCaseMulti;
export type TestCaseSelector = (root: Root) => Arrayable<YamlUnistNode>;

export type TestCaseSingle = [string, TestCaseSelector];
export type TestCaseMulti = [string, TestCaseSelector[]];

export function getFirstContent<T extends YamlUnistNode>(): (root: Root) => T;
export function getFirstContent<T extends YamlUnistNode>(root: Root): T;
export function getFirstContent<T extends YamlUnistNode>(root?: Root) {
  return !root
    ? (_root: Root) => _root.children[0].children[1].children[0] as T
    : (root.children[0].children[1].children[0] as T);
}

export interface SnapshotNodeOptions extends StringifyNodeOptions {
  codeFrameMaxHeight?: number;
  selectNodeToStringify?: (node: YamlUnistNode) => YamlUnistNode;
}

export function testCases(
  cases: TestCase[],
  options: SnapshotNodeOptions = {},
) {
  cases.forEach(testCase => {
    const [text, selector] = testCase;
    const root = parse(text);
    const selectNodes = ([] as TestCaseSelector[]).concat(selector);
    selectNodes.forEach(selectNode => {
      const nodes = ([] as YamlUnistNode[]).concat(selectNode(root));
      nodes.forEach(node => {
        test(`${JSON.stringify(text).slice(0, 60)}`, () => {
          expect(wrap(snapshotNode(text, node, options))).toMatchSnapshot();
        });
      });
    });
  });
}

function getNodeDescription(node: YamlUnistNode) {
  return `${node.type} (${[
    `${node.position.start.line}:${node.position.start.column}`,
    `${node.position.end.line}:${node.position.end.column}`,
  ].join(" ~ ")})`;
}

function snapshotNode(
  text: string,
  node: YamlUnistNode,
  options: SnapshotNodeOptions = {},
) {
  const { selectNodeToStringify = (x: YamlUnistNode) => x } = options;
  const stringifiedNode = selectNodeToStringify(node);
  return (
    `${getNodeDescription(node)}\n` +
    codeFrameColumns(text, node.position, options.codeFrameMaxHeight) +
    "\n" +
    (node !== stringifiedNode
      ? `${getNodeDescription(stringifiedNode)}\n`
      : "") +
    stringifyNode(stringifiedNode, options)
  ).replace(/ +$/gm, "");
}

export interface StringifyNodeOptions {
  maxChildrenLevel?: number;
  maxCommentsLevel?: number;
}

function stringifyNode(
  node: YamlUnistNode | Node,
  options: StringifyNodeOptions = {},
): string {
  const attributes = Object.keys(node)
    .filter(key => {
      switch (key) {
        case "type":
        case "position":
        case "children":
        case "comments":
        case "leadingComments":
        case "middleComments":
        case "trailingComments":
        case "endComments":
        case "anchor":
        case "tag":
          return false;
        default:
          return true;
      }
    })
    .map(key => `${key}=${JSON.stringify(node[key as keyof typeof node])}`)
    .sort()
    .map((attribute, index) => (index === 0 ? " " + attribute : attribute))
    .join(" ");
  const propNodes =
    "tag" in node
      ? [node.tag, node.anchor]
          .filter(propNode => propNode.type !== "null")
          .map(propNode => stringifyNode(propNode))
      : [];
  const comments =
    options.maxCommentsLevel === undefined || options.maxCommentsLevel > 0
      ? ([] as string[])
          .concat("leadingComments" in node ? "leadingComments" : [])
          .concat("middleComments" in node ? "middleComments" : [])
          .concat("trailingComments" in node ? "trailingComments" : [])
          .concat("endComments" in node ? "endComments" : [])
          .map(key =>
            // @ts-ignore
            (node[key] as Comment[]).map(
              comment =>
                `<${key.slice(0, -1)} value=${JSON.stringify(comment.value)}>`,
            ),
          )
          .reduce((a, b) => a.concat(b), [])
      : [];
  return "children" in node || comments.length !== 0 || propNodes.length !== 0
    ? `<${node.type}${attributes}>\n${indent(
        ([] as string[])
          .concat(
            propNodes,
            comments,
            (options.maxChildrenLevel === undefined ||
              options.maxChildrenLevel > 0) &&
            "children" in node
              ? (node.children as YamlUnistNode[]).map(childNode =>
                  stringifyNode(childNode, {
                    ...options,
                    ...(options.maxChildrenLevel !== undefined && {
                      maxChildrenLevel: options.maxChildrenLevel - 1,
                    }),
                    ...(options.maxCommentsLevel !== undefined && {
                      maxCommentsLevel: options.maxCommentsLevel - 1,
                    }),
                  }),
                )
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

function codeFrameColumns(
  text: string,
  position: Position,
  codeFrameMaxHeight = Infinity,
) {
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

  const start = Math.max(0, position.start.line - 1 - codeFrameMaxHeight);
  const end = Math.min(lines.length, position.end.line + codeFrameMaxHeight);

  const gutterWidth = Math.floor(Math.log10(lines.length)) + 1;

  return lines
    .slice(start, end)
    .reduce(
      (reduced, line, index) => {
        const gutter = leftpad(`${index + 1 + start}`, gutterWidth);
        return reduced.concat(
          `${gutter} | ${line.replace(/ /g, "·")}`,
          markerLines[index + start]
            ? `${" ".repeat(gutterWidth)} | ${markerLines[index + start]}`
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

export function testSyntaxError(text: string, message?: string) {
  try {
    parse(text);
    throw new Error("SyntaxError not found");
  } catch (error) {
    if (!isYAMLError(error)) {
      throw error;
    }
    test(message || error.message, () => {
      expect(
        error.message + "\n" + codeFrameColumns(error.source, error.position),
      ).toMatchSnapshot();
    });
  }
}
