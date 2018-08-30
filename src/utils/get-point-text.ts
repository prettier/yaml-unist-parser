import { Point } from "../types";

// istanbul ignore next
export function getPointText(point: Point) {
  return `${point.line}:${point.column}`;
}
