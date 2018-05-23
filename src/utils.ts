import { Context } from "./transform";
import {
  Comment,
  CommentAttachable,
  Content,
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
  return { anchor: null, tag: null };
}

export function createCommentAttachableNode(): CommentAttachable {
  return {
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
