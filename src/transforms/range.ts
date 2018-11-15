import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Position } from "../types";

export interface Range {
  origStart: number;
  origEnd: number;
}

export function transformRange(range: Range, context: Context): Position {
  return createPosition(
    context.transformOffset(range.origStart),
    context.transformOffset(range.origEnd),
  );
}
