import { createQuoteSingle } from "../factories/quote-single.js";
import { Context } from "../transform.js";
import { QuoteSingle } from "../types.js";
import * as YAML from "../yaml.js";
import { transformAstQuoteValue } from "./quote-value.js";

export function transformQuoteSingle(
  quoteSingle: YAML.ast.QuoteSingle,
  context: Context,
): QuoteSingle {
  return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}
