import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createBlockFolded } from "../factories/block-folded.ts";
import type { BlockFolded } from "../types.ts";
import { transformAstBlockValue } from "./block-value.ts";
import type Context from "./context.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformBlockFolded(
  blockFolded: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): BlockFolded {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    blockFolded.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "block-scalar") {
    throw new Error("Expected block scalar srcToken");
  }
  return createBlockFolded(
    transformAstBlockValue(blockFolded, srcToken, context, props),
  );
}
