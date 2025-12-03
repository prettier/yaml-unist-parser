import { type QuoteSingle, type QuoteValue } from "../types.ts";

export function createQuoteSingle(quoteValue: QuoteValue): QuoteSingle {
  return {
    ...quoteValue,
    type: "quoteSingle",
  };
}
