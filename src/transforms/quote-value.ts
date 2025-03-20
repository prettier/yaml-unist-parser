import { createQuoteValue } from "../factories/quote-value.js";
import type Context from "./context.js";
import { type QuoteValue } from "../types.js";
import type * as YAML from "../yaml.js";

export function transformAstQuoteValue(
  quoteValue: YAML.ast.QuoteDouble | YAML.ast.QuoteSingle,
  context: Context,
): QuoteValue {
  const cstNode = quoteValue.cstNode!;
  return createQuoteValue(
    context.transformRange(cstNode.valueRange!),
    context.transformContent(quoteValue),
    cstNode.strValue as string,
  );
}
