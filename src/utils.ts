import { Context } from "./transform";
import {
  Comment,
  CommentAttachable,
  Content,
  Null,
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

export function defineCommentParent(comment: Comment, parent: YamlUnistNode) {
  Object.defineProperty(comment, "parent", {
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

export function createContentNode(): Content {
  return {
    anchor: createNull(),
    tag: createNull(),
    middleComments: [],
  };
}

export function createCommentAttachableNode(): CommentAttachable {
  return {
    leadingComments: [],
    trailingComments: [],
  };
}

export function createNull(): Null {
  return {
    type: "null",
    position: {
      start: { line: -1, column: -1, offset: -1 },
      end: { line: -1, column: -1, offset: -1 },
    },
  };
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
    if ("trailingComments" in node && node.trailingComments.length !== 0) {
      const lastTrailingComment =
        node.trailingComments[node.trailingComments.length - 1];
      if (
        lastTrailingComment.position.end.offset > parentNode.position.end.offset
      ) {
        overwriteEnd(parentNode, lastTrailingComment.position.end);
      }
    }
    if (node.position.end.offset > parentNode.position.end.offset) {
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
  if (from < text.length) {
    for (let i = from; i >= 0; i--) {
      const char = text[i];
      if (regex.test(char)) {
        return i;
      }
    }
  }
  return -1;
}
