import { createBlockFolded } from "../factories/block-folded.js";
import { Context } from "../transform.js";
import { BlockFolded, YAMLBlockFolded } from "../types.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockFolded(
  blockFolded: YAMLBlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
