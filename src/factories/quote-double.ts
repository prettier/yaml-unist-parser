import { QuoteDouble, QuoteValue } from "../types";

export function createQuoteDouble(quoteValue: QuoteValue): QuoteDouble {
  return {
    ...quoteValue,
    type: "quoteDouble",
  };
}
