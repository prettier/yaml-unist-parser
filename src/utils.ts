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

export function getLast<T>(array: T[]) {
  return array[array.length - 1] as T | undefined;
}

export function defineCommentParent(comment: Comment, parent: YamlUnistNode) {
  Object.defineProperty(comment, "parent", {
    value: parent,
    enumerable: false,
  });
}

function createError(message: string, position: Position, context: Context) {
  const error: Partial<YAMLSyntaxError> = new SyntaxError(message);
  error.name = "YAMLSyntaxError";
  error.source = context.text;
  error.position = position;
  return error as YAMLSyntaxError;
}

export function assertSyntaxError(
  value: boolean,
  message: string | (() => string),
  position: Position | (() => Position),
  context: Context,
) {
  if (!value) {
    // istanbul ignore next
    throw createError(
      typeof message === "function" ? message() : message,
      typeof position === "function" ? position() : position,
      context,
    );
  }
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
