import { Context } from "./transform";
import {
  BlockFolded,
  BlockLiteral,
  Comment,
  MappingItem,
  Point,
  Position,
  YAMLSyntaxError,
  YamlUnistNode,
} from "./types";

export function overwriteStart(node: YamlUnistNode, start: Point) {
  node.position = { start, end: node.position.end };
}

export function overwriteEnd(node: YamlUnistNode, end: Point) {
  node.position = { start: node.position.start, end };
}

export function getLast<T>(array: T[]) {
  return array[array.length - 1] as T | undefined;
}

export function defineParent(node: YamlUnistNode, parent: YamlUnistNode) {
  Object.defineProperty(node, "parent", {
    value: parent,
    enumerable: false,
  });
}

export function createError(
  rawError: Extract<yaml.YAMLError, SyntaxError>,
  context: Context,
) {
  const error: Partial<YAMLSyntaxError> = new SyntaxError(rawError.message);
  error.name = "YAMLSyntaxError";
  error.source = context.text;
  error.position = context.transformRange(
    // istanbul ignore next
    (rawError.source.range || rawError.source.valueRange)!,
  );
  return error as YAMLSyntaxError;
}

export function getStartPoint(node: YamlUnistNode): Point {
  const tagPosition =
    "tag" in node && node.tag.type !== "null" && node.tag.position;
  const anchorPosition =
    "anchor" in node && node.anchor.type !== "null" && node.anchor.position;
  return !tagPosition && !anchorPosition
    ? node.position.start
    : tagPosition && anchorPosition
      ? tagPosition.start.offset < anchorPosition.start.offset
        ? tagPosition.start
        : anchorPosition.start
      : tagPosition
        ? tagPosition.start
        : (anchorPosition as Position).start;
}

export function updateEndPoints(
  node: YamlUnistNode,
  nodeStack: YamlUnistNode[] = [],
): void {
  if ("children" in node && node.children.length !== 0) {
    (node.children as YamlUnistNode[]).forEach(childNode => {
      updateEndPoints(childNode, nodeStack.concat(node));
    });
  }

  if (nodeStack.length !== 0) {
    const parentNode = nodeStack[nodeStack.length - 1];
    const commentKeys = ["endComments", "trailingComments"];
    for (const commentKey of commentKeys) {
      // @ts-ignore
      const comments = node[commentKey] as undefined | Comment[];
      if (comments && comments.length !== 0) {
        const lastComment = comments[comments.length - 1];
        if (lastComment.position.end.offset > parentNode.position.end.offset) {
          overwriteEnd(parentNode, lastComment.position.end);
        }
      }
    }
    if (
      node.type !== "null" &&
      node.position.end.offset > parentNode.position.end.offset
    ) {
      overwriteEnd(parentNode, node.position.end);
    }
  }
}

export function isYAMLError(e: any): e is yaml.YAMLError {
  return (
    e instanceof Error &&
    (e.name === "YAMLSyntaxError" || e.name === "YAMLSemanticError")
  );
}

export function findLastCharIndex(text: string, from: number, regex: RegExp) {
  // istanbul ignore else
  if (from < text.length) {
    for (let i = from; i >= 0; i--) {
      const char = text[i];
      if (regex.test(char)) {
        return i;
      }
    }
  }

  // istanbul ignore next
  return -1;
}

export function isExplicitMappingItem(mappingItem: MappingItem) {
  const [key, value] = mappingItem.children;
  return (
    value.type === "null" ||
    key.position.start.line !== value.position.start.line
  );
}

export function isBlockValue(
  node: YamlUnistNode,
): node is BlockFolded | BlockLiteral {
  return node.type === "blockFolded" || node.type === "blockLiteral";
}
