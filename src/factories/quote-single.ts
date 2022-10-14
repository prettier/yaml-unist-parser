import { QuoteSingle, QuoteValue } from "../types.js";

export function createQuoteSingle(quoteValue: QuoteValue): QuoteSingle {
  return {
    ...quoteValue,
    type: "quoteSingle",
  };
}
