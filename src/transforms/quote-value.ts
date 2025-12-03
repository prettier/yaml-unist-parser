import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createQuoteValue } from "../factories/quote-value.ts";
import type { QuoteValue } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import type Context from "./context.ts";
import { type TransformNodeProperties } from "./transform.ts";

export function transformAstQuoteValue(
  quoteValue: YAML.Scalar.Parsed,
  srcToken: YAML_CST.SingleQuotedFlowScalar | YAML_CST.DoubleQuotedFlowScalar,
  context: Context,
  props: TransformNodeProperties,
): QuoteValue {
  for (const token of extractComments(srcToken.end, context)) {
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type in quote value end: ${token.type}`);
  }
  return createQuoteValue(
    context.transformRange({
      origStart: quoteValue.range[0],
      origEnd: quoteValue.range[1],
    }),
    context.transformContentProperties(quoteValue, props.tokens),
    quoteValue.source,
  );
}
