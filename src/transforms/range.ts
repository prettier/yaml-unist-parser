import { Context } from "../transform";
import { Position } from "../types";
import { cloneObject } from "../utils";

export function transformRange(
  range: number | { start: number; end: number },
  context: Context,
): Position {
  if (typeof range === "number") {
    const point = context.transformOffset(range);
    return {
      start: point,
      end: cloneObject(point),
    };
  } else {
    return {
      start: context.transformOffset(range.start),
      end: context.transformOffset(range.end),
    };
  }
}
