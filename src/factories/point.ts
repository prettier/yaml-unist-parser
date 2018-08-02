import { Point } from "../types";

export function createPoint(
  offset: number,
  line: number,
  column: number,
): Point {
  return { offset, line, column };
}
