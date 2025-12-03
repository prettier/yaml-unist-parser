import { type Point } from "../types.ts";

// istanbul ignore next -- @preserve
export function getPointText(point: Point) {
  return `${point.line}:${point.column}`;
}
