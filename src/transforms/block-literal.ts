import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createBlockLiteral } from "../factories/block-literal.ts";
import type { BlockLiteral } from "../types.ts";
import { transformAstBlockValue } from "./block-value.ts";
import type Context from "./context.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformBlockLiteral(
  blockLiteral: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): BlockLiteral {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    blockLiteral.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "block-scalar") {
    throw new Error("Expected block scalar srcToken");
  }
  return createBlockLiteral(
    transformAstBlockValue(blockLiteral, srcToken, context, props),
  );
}
