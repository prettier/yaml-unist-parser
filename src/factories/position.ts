import { Point, Position } from "../types";

export function createPosition(start: Point, end: Point): Position {
  return { start, end };
}
