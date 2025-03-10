import { createQuoteSingle } from "../factories/quote-single.js";
import { Context } from "../transform.js";
import { QuoteSingle, YAMLQuoteSingle } from "../types.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteSingle(
  quoteSingle: YAMLQuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
