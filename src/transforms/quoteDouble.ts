import assert = require("assert");
import { createQuoteDouble } from "../factories/quote-double";
import { Context } from "../transform";
import { QuoteDouble } from "../types";
import { transformQuoteValue } from "./quoteValue";

export function transformQuoteDouble(
  quoteDouble: yaml.QuoteValue,
  context: Context,
): QuoteDouble {
  assert(quoteDouble.type === "QUOTE_DOUBLE");
  return createQuoteDouble(transformQuoteValue(quoteDouble, context));
}
