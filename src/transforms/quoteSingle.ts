import assert = require("assert");
import YAML from "yaml";
import { createQuoteSingle } from "../factories/quote-single";
import { Context } from "../transform";
import { QuoteSingle } from "../types";
import { transformQuoteValue } from "./quoteValue";

export function transformQuoteSingle(
  quoteSingle: YAML.cst.QuoteValue,
  context: Context,
): QuoteSingle {
  assert(quoteSingle.type === "QUOTE_SINGLE");
  return createQuoteSingle(transformQuoteValue(quoteSingle, context));
}
