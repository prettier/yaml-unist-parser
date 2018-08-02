import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Position } from "../types";

export function transformRange(
  range: { start: number; end: number },
  context: Context,
): Position {
  return createPosition(
    context.transformOffset(range.start),
    context.transformOffset(range.end),
  );
}
