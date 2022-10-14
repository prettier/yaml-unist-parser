import { Point } from "../types.js";

// istanbul ignore next
export function getPointText(point: Point) {
  return `${point.line}:${point.column}`;
}
