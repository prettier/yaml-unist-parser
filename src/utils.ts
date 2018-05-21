import { Comment, YamlUnistNode } from "./types";

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
