import { Context } from "../transform";
import { Position } from "../types";
import { cloneObject } from "../utils";
import { transformOffset } from "./offset";

export function transformRange(
  range: number | { start: number; end: number },
  context: Context,
): Position {
  if (typeof range === "number") {
    const point = transformOffset(range, context);
    return {
      start: point,
      end: cloneObject(point),
    };
  } else {
    return {
      start: transformOffset(range.start, context),
      end: transformOffset(range.end, context),
    };
  }
}
