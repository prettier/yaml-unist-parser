import { wrap } from "jest-snapshot-serializer-raw";
import YAML from "yaml";

import { parse } from "./parse.js";
import {
  Anchor,
  Comment,
  LinePos,
  Node,
  Position,
  Root,
  Tag,
  YamlUnistNode,
} from "./types.js";

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

    testCrLf(root, text);

    const selectNodes = ([] as TestCaseSelector[]).concat(selector);
    selectNodes.forEach(selectNode => {
      const nodes = ([] as YamlUnistNode[]).concat(selectNode(root));
      nodes.forEach(node => {
        test(getTestTitle(text), () => {
          expect(wrap(snapshotNode(text, node, options))).toMatchSnapshot();
        });
      });
    });
  });
}

function testCrLf(lfRoot: Root, lfText: string) {
  const crLfText = lfText.replace(/\n/g, "\r\n");

  test(getTestTitle(lfText), () => {
    const crLfRoot = parse(crLfText);
    testNode(lfRoot, crLfRoot);
  });

  function testNode(lfNode: Node, crLfNode: Node) {
    const [lfNodeProps, lfValueProps] = groupProps(lfNode);
    const [crLfNodeProps, crLfValueProps] = groupProps(crLfNode);

    expect(lfNodeProps).toEqual(crLfNodeProps);
    expect(lfValueProps).toEqual(crLfValueProps);

    for (const prop of lfValueProps as Array<keyof Node>) {
      const lfValue = lfNode[prop];
      const crLfValue = crLfNode[prop];

      if (typeof crLfValue === "string") {
        expect(crLfValue.replace(/\r\n/g, "\n")).toEqual(lfValue);
      } else {
        expect(crLfValue).toEqual(lfValue);
      }
    }

    for (const prop of lfNodeProps as Array<keyof Node>) {
      const lfChildNode = lfNode[prop];
      const crLfChildNode = crLfNode[prop];

      if (Array.isArray(lfChildNode) && Array.isArray(crLfChildNode)) {
        for (let i = 0; i < lfChildNode.length; i++) {
          testNode(lfChildNode[i], crLfChildNode[i]);
        }
      } else {
        expect(isNode(lfChildNode)).toBe(true);
        expect(isNode(crLfChildNode)).toBe(true);
        testNode(lfChildNode as Node, crLfChildNode as Node);
      }
    }

    expect([
      crLfNode.type,
      JSON.stringify(
        getOriginalText(crLfNode, crLfText).replace(/\r\n/g, "\n"),
      ),
    ]).toEqual([lfNode.type, JSON.stringify(getOriginalText(lfNode, lfText))]);
  }

  function getOriginalText(node: Node, text: string) {
    return text.slice(node.position.start.offset, node.position.end.offset);
  }

  function groupProps(node: Node) {
    const nodeProps: string[] = [];
    const valueProps: string[] = [];

    for (const key of Object.keys(node) as Array<keyof Node>) {
      if (key === "position") {
        continue;
      }

      const value = node[key];

      if (isNode(value) || (Array.isArray(value) && value.some(isNode))) {
        nodeProps.push(key);
      } else {
        valueProps.push(key);
      }
    }

    return [nodeProps, valueProps];
  }

  function isNode(value: any): value is Node {
    return value ? typeof value.type === "string" : false;
  }
}

function getTestTitle(text: string) {
  return JSON.stringify(text).slice(0, 60);
}

function getNodeDescription(node: Exclude<YamlUnistNode, null>) {
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
  if (node === null) {
    return "null";
  }

  const { selectNodeToStringify = (x: YamlUnistNode) => x } = options;
  const stringifiedNode = selectNodeToStringify(node)!;
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
  if (node === null) {
    return "<null />";
  }

  const attributes = Object.keys(node)
    .filter(key => {
      switch (key) {
        case "type":
        case "position":
        case "children":
        case "comments":
        case "leadingComments":
        case "middleComments":
        case "trailingComment":
        case "endComments":
        case "indicatorComment":
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
      ? (
          [node.tag, node.anchor].filter(
            propNode => propNode !== null,
          ) as Array<NonNullable<Tag | Anchor>>
        ).map(propNode => stringifyNode(propNode))
      : [];
  const comments =
    options.maxCommentsLevel === undefined || options.maxCommentsLevel > 0
      ? ([] as string[])
          .concat("leadingComments" in node ? "leadingComments" : [])
          .concat("middleComments" in node ? "middleComments" : [])
          .concat("indicatorComment" in node ? "indicatorComment" : [])
          .concat("trailingComment" in node ? "trailingComment" : [])
          .concat("endComments" in node ? "endComments" : [])
          .map(key =>
            // @ts-expect-error why?
            ([].concat(node[key]).filter(Boolean) as Comment[]).map(
              comment =>
                `<${key.replace(/s$/, "")} value=${JSON.stringify(
                  comment.value,
                )}>`,
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
  position: Position | [LinePos, LinePos],
  codeFrameMaxHeight = Infinity,
) {
  const isLinePos = Array.isArray(position);

  const startLine = isLinePos ? position[0].line : position.start.line;
  const startColumn = isLinePos ? position[0].col : position.start.column;
  const endLine = isLinePos ? position[1].line : position.end.line;
  const endColumn = isLinePos ? position[1].col : position.end.column;

  const lines = text.split("\n").map(line => `${line}¶`);
  const markerLines = lines.map((line, index) => {
    if (!position || index < startLine - 1 || index > endLine - 1) {
      return "";
    }

    if (index === startLine - 1) {
      return (
        " ".repeat(startColumn - 1) +
        (index === endLine - 1 && startColumn === endColumn
          ? "~"
          : "^".repeat(
              (index === endLine - 1 ? endColumn - 1 : line.length) -
                (startColumn - 1),
            ))
      );
    }

    if (index === endLine - 1) {
      return endColumn === 1 && line === "¶" ? "^" : "^".repeat(endColumn - 1);
    }

    return "^".repeat(line.length);
  });

  const start = Math.max(0, startLine - 1 - codeFrameMaxHeight);
  const end = Math.min(lines.length, endLine + codeFrameMaxHeight);

  const gutterWidth = Math.floor(Math.log10(lines.length)) + 1;

  return lines
    .slice(start, end)
    .reduce((reduced, line, index) => {
      const gutter = leftpad(`${index + 1 + start}`, gutterWidth);
      return reduced.concat(
        `${gutter} | ${line.replace(/ /g, "·")}`,
        markerLines[index + start]
          ? `${" ".repeat(gutterWidth)} | ${markerLines[index + start]}`
          : [],
      );
    }, [] as string[])
    .join("\n");
}

function leftpad(text: string, width: number) {
  return " ".repeat(Math.max(0, width - text.length)) + text;
}

export function testSyntaxError(text: string, message?: string) {
  try {
    parse(text);
    throw new Error("SyntaxError not found");
  } catch (error: any) {
    if (!(error instanceof YAML.YAMLError)) {
      throw error;
    }
    test(message || error.message, () => {
      expect(
        error.message +
          "\n" +
          codeFrameColumns(error.code, error.linePos as [LinePos, LinePos]),
      ).toMatchSnapshot();
    });
  }
}
