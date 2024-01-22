import { createQuoteValue } from "../factories/quote-value.js";
import { Context } from "../transform.js";
import { QuoteValue, YAMLQuoteDouble, YAMLQuoteSingle } from "../types.js";

export function transformAstQuoteValue(
  quoteValue: YAMLQuoteDouble | YAMLQuoteSingle,
  context: Context,
): QuoteValue {
  const cstNode = quoteValue.cstNode!;
  return createQuoteValue(
    context.transformRange(cstNode.valueRange!),
    context.transformContent(quoteValue),
    cstNode.strValue as string,
  );
}
