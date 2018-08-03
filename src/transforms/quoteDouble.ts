import assert = require("assert");
import YAML from "yaml";
import { createQuoteDouble } from "../factories/quote-double";
import { Context } from "../transform";
import { QuoteDouble } from "../types";
import { transformQuoteValue } from "./quoteValue";

export function transformQuoteDouble(
  quoteDouble: YAML.cst.QuoteValue,
  context: Context,
): QuoteDouble {
  assert(quoteDouble.type === "QUOTE_DOUBLE");
  return createQuoteDouble(transformQuoteValue(quoteDouble, context));
}
