import assert = require("assert");
import { Context } from "../transform";
import { Point } from "../types";

export function transformOffset(offset: number, context: Context): Point {
  const location = context.locator.locationForIndex(offset);
  assert(location !== null);
  return {
    line: location!.line + 1,
    column: location!.column + 1,
    offset,
  };
}
