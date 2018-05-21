import { Context } from "./transform";
import { Comment, Position, YAMLSyntaxError, YamlUnistNode } from "./types";

export function cloneObject<T extends { [key: string]: any }>(x: T): T {
  const newObject: Partial<T> = {};
  for (const key of Object.keys(x)) {
    const value = x[key];
    newObject[key] =
      value && typeof value === "object" ? cloneObject(value) : value;
  }
  return newObject as T;
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
