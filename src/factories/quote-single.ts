import { QuoteSingle, QuoteValue } from "../types";

export function createQuoteSingle(quoteValue: QuoteValue): QuoteSingle {
  return {
    ...quoteValue,
    type: "quoteSingle",
  };
}
