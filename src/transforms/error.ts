import { createError } from "../factories/error.js";
import type Context from "./context.js";
import type { YAMLSyntaxError, Range } from "../types.js";
import type * as YAML from "../yaml.js";

export function transformError(
  error: Extract<YAML.YAMLError, SyntaxError>,
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
