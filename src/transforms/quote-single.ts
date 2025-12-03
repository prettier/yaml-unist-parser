import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createQuoteSingle } from "../factories/quote-single.js";
import { type QuoteSingle } from "../types.js";
import type Context from "./context.js";
import { transformAstQuoteValue } from "./quote-value.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformQuoteSingle(
  quoteSingle: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): QuoteSingle {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    quoteSingle.srcToken;

  // istanbul ignore next
  if (!srcToken || srcToken.type !== "single-quoted-scalar") {
    throw new Error("Expected single-quoted scalar srcToken");
  }

  return createQuoteSingle(
    transformAstQuoteValue(quoteSingle, srcToken, context, props),
  );
}
