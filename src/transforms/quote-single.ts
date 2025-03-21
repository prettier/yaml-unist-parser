import type * as YAML from "yaml";
import { createQuoteSingle } from "../factories/quote-single.js";
import { type QuoteSingle } from "../types.js";
import type Context from "./context.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteSingle(
  quoteSingle: YAML.AST.QuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
