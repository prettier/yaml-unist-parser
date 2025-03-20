import { type QuoteSingle, type QuoteValue } from "../types.js";

export function createQuoteSingle(quoteValue: QuoteValue): QuoteSingle {
  return {
    ...quoteValue,
    type: "quoteSingle",
  };
}
