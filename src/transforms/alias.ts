import type * as YAML from "yaml";
import { createAlias } from "../factories/alias.js";
import { type Alias } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import type Context from "./context.js";
import { type TransformNodeProperties } from "./transform.js";

export function transformAlias(
  alias: YAML.Alias.Parsed,
  context: Context,
  props: TransformNodeProperties,
): Alias {
  const srcToken = alias.srcToken!;
  for (const token of extractComments(srcToken.end, context)) {
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type in alias end: ${token.type}`);
  }

  return createAlias(
    context.transformRange({
      origStart: alias.range[0],
      origEnd: alias.range[1],
    }),
    context.transformContentProperties(alias, props.tokens),
    alias.source,
  );
}
