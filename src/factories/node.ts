import { type Position } from "../types.ts";

export function createNode<T extends string>(type: T, position: Position) {
  return { type, position };
}
