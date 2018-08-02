import assert = require("assert");
import { createQuoteValue } from "../factories/quote-value";
import { Context } from "../transform";
import { QuoteValue } from "../types";

export function transformQuoteValue(
  quoteValue: yaml.QuoteValue,
  context: Context,
): QuoteValue {
  assert(quoteValue.valueRange !== null);
  assert(typeof quoteValue.strValue === "string");
  return createQuoteValue(
    context.transformRange(quoteValue.valueRange!),
    quoteValue.strValue as string,
  );
}
