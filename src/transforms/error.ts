import { createError } from "../factories/error.js";
import { Context } from "../transform.js";
import { YAMLSyntaxError } from "../types.js";
import * as YAML from "../yaml.js";

export function transformError(
  error: Extract<YAML.YAMLError, SyntaxError>,
  context: Context,
): YAMLSyntaxError {
  // istanbul ignore next
  const range = (error.source!.range || error.source!.valueRange)!;
  return createError(
    error.message,
    context.text,
    context.transformRange(range),
  );
}
