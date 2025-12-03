import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createQuoteSingle } from "../factories/quote-single.ts";
import { type QuoteSingle } from "../types.ts";
import type Context from "./context.ts";
import { transformAstQuoteValue } from "./quote-value.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformQuoteSingle(
  quoteSingle: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): QuoteSingle {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    quoteSingle.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "single-quoted-scalar") {
    throw new Error("Expected single-quoted scalar srcToken");
  }

  return createQuoteSingle(
    transformAstQuoteValue(quoteSingle, srcToken, context, props),
  );
}
