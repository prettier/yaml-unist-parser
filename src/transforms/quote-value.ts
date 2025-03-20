import { createQuoteValue } from "../factories/quote-value.js";
import {
  type QuoteValue,
  type YAMLQuoteDouble,
  type YAMLQuoteSingle,
} from "../types.js";
import type Context from "./context.js";

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
