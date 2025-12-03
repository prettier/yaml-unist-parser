import type * as YAML from "yaml";
import { createError } from "../factories/error.ts";
import type { YAMLSyntaxError } from "../types.ts";
import type Context from "./context.ts";

export function transformError(
  error: YAML.YAMLError,
  context: Context,
): YAMLSyntaxError {
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
