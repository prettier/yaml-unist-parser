import { type QuoteDouble, type QuoteValue } from "../types.ts";

export function createQuoteDouble(quoteValue: QuoteValue): QuoteDouble {
  return {
    ...quoteValue,
    type: "quoteDouble",
  };
}
