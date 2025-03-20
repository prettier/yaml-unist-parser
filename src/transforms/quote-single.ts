import { createQuoteSingle } from "../factories/quote-single.js";
import { type QuoteSingle, type YAMLQuoteSingle } from "../types.js";
import type Context from "./context.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteSingle(
  quoteSingle: YAMLQuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
