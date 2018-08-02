import { Position } from "../types";

export function createNode<T extends string>(type: T, position: Position) {
  return { type, position };
}
