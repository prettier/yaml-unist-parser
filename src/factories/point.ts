import { Point } from "../types.js";

export function createPoint(
  offset: number,
  line: number,
  column: number,
): Point {
  return { offset, line, column };
}
