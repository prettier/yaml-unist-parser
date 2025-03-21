import { type YAMLError } from "yaml/util";
import { createError } from "../factories/error.js";
import type { Range, YAMLSyntaxError } from "../types.js";
import type Context from "./context.js";

export function transformError(
  error: Extract<YAMLError, SyntaxError>,
  context: Context,
): YAMLSyntaxError {
  // istanbul ignore next
  const range = (error.source!.range || error.source!.valueRange) as Range;
  return createError(
    error.message,
    context.text,
    context.transformRange(range),
  );
}
