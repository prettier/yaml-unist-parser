import { createPosition } from "../factories/position.js";
import { Context } from "../transform.js";
import { Position } from "../types.js";

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
