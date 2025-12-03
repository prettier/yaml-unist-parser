import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createBlockFolded } from "../factories/block-folded.js";
import type { BlockFolded } from "../types.js";
import { transformAstBlockValue } from "./block-value.js";
import type Context from "./context.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformBlockFolded(
  blockFolded: YAML.Scalar.Parsed,
  context: Context,
  props: TransformNodeProperties,
): BlockFolded {
  const srcToken: YAML_CST.FlowScalar | YAML.CST.BlockScalar | undefined =
    blockFolded.srcToken;

  // istanbul ignore next
  if (!srcToken || srcToken.type !== "block-scalar") {
    throw new Error("Expected block scalar srcToken");
  }
  return createBlockFolded(
    transformAstBlockValue(blockFolded, srcToken, context, props),
  );
}
