import { Position } from "../types.js";

export function createNode<T extends string>(type: T, position: Position) {
  return { type, position };
}
