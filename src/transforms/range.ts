import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Position } from "../types";

export interface Range {
  start: number;
  end: number;
}

export function transformRange(range: Range, context: Context): Position {
  return createPosition(
    context.transformOffset(range.start),
    context.transformOffset(range.end),
  );
}
