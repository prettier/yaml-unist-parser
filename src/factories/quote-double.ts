import { type QuoteDouble, type QuoteValue } from "../types.js";

export function createQuoteDouble(quoteValue: QuoteValue): QuoteDouble {
  return {
    ...quoteValue,
    type: "quoteDouble",
  };
}
