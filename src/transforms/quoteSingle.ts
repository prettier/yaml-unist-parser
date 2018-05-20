import assert = require("assert");
import { Context } from "../transform";
import { QuoteSingle } from "../types";
import { transformQuoteValue } from "./quoteValue";

export function transformQuoteSingle(
  quoteSingle: yaml.QuoteValue,
  context: Context,
): QuoteSingle {
  assert(quoteSingle.type === "QUOTE_SINGLE");
  return {
    ...transformQuoteValue(quoteSingle, context),
    type: "quoteSingle",
  };
}
