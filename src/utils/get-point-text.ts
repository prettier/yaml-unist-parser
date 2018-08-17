import { Point } from "../types";

export function getPointText(point: Point) {
  return `${point.line}:${point.column}`;
}
