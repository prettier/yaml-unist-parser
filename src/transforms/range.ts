import { Context } from "../transform";
import { Position } from "../types";
import {} from "../utils";

export function transformRange(
  range: { start: number; end: number },
  context: Context,
): Position {
  return {
    start: context.transformOffset(range.start),
    end: context.transformOffset(range.end),
  };
}
