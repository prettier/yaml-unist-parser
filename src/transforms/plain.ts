import type * as YAML from "yaml";
import { createPlain } from "../factories/plain.ts";
import type { Plain } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import { findLastCharIndex } from "../utils/find-last-char-index.ts";
import type Context from "./context.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformPlain(
  plain: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): Plain {
  if (plain.range[0] === plain.range[1]) {
    // empty plain scalar
    const index =
      findLastCharIndex(context.text, plain.range[0] - 1, /\S/u) + 1;
    return createPlain(
      context.transformRange([index, index]),
      context.transformContentProperties(plain, props.tokens),
      "",
    );
  }

  const srcToken = plain.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "scalar") {
    throw new Error("Expected plain scalar srcToken");
  }

  for (const token of extractComments(srcToken.end, context)) {
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type in plain scalar end: ${token.type}`);
  }

  return createPlain(
    context.transformRange(plain.range),
    context.transformContentProperties(plain, props.tokens),
    plain.source,
  );
}
