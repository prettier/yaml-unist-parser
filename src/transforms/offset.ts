import assert = require("assert");
import { createPoint } from "../factories/point";
import { Context } from "../transform";
import { Point } from "../types";

export function transformOffset(offset: number, context: Context): Point {
  const location = context.locator.locationForIndex(offset);
  assert(location !== null);
  return createPoint(offset, location!.line + 1, location!.column + 1);
}
