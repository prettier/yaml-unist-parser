import type * as YAML from "yaml";
import { createError } from "../factories/error.js";
import type { YAMLSyntaxError } from "../types.js";
import type Context from "./context.js";

export function transformError(
  error: YAML.YAMLError,
  context: Context,
): YAMLSyntaxError {
  // istanbul ignore next
  const range = error.pos;
  return createError(
    error.message,
    context.text,
    context.transformRange({
      origStart: range[0],
      origEnd: range[1],
    }),
  );
}
