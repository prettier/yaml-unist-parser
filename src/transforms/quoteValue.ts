import assert = require("assert");
import { Context } from "../transform";
import { QuoteValue } from "../types";
import { transformRange } from "./range";

export function transformQuoteValue(
  quoteValue: yaml.QuoteValue,
  context: Context,
): QuoteValue {
  assert(quoteValue.valueRange !== null);
  assert(typeof quoteValue.strValue === "string");
  return {
    type: "quoteBase",
    value: quoteValue.strValue as string,
    position: transformRange(quoteValue.valueRange!, context),
    leadingComments: [],
    trailingComments: [],
  };
}
