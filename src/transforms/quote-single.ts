import YAML from "yaml";
import { createQuoteSingle } from "../factories/quote-single";
import { Context } from "../transform";
import { QuoteSingle } from "../types";
import { transformAstQuoteValue } from "./quote-value";

export function transformQuoteSingle(
  quoteSingle: YAML.ast.QuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
