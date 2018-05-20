import assert = require("assert");
import { Context } from "../transform";
import { QuoteDouble } from "../types";
import { transformQuoteValue } from "./quoteValue";

export function transformQuoteDouble(
  quoteDouble: yaml.QuoteValue,
  context: Context,
): QuoteDouble {
  assert(quoteDouble.type === "QUOTE_DOUBLE");
  return {
    ...transformQuoteValue(quoteDouble, context),
    type: "quoteDouble",
  };
}
