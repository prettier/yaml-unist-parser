import { createError } from "../factories/error";
import { Context } from "../transform";
import { YAMLSyntaxError } from "../types";
import * as YAML from "../yaml";

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
