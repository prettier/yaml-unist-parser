import { createQuoteSingle } from "../factories/quote-single.js";
import type Context from "./context.js";
import { type QuoteSingle } from "../types.js";
import type * as YAML from "../yaml.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteSingle(
  quoteSingle: YAML.ast.QuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
