import { type Point, type Position } from "../types.js";

export function createPosition(start: Point, end: Point): Position {
  return { start, end };
}
export function createEmptyPosition(point: Point): Position {
  return { start: point, end: point };
}
