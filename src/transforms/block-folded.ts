import { createBlockFolded } from "../factories/block-folded.js";
import { type BlockFolded, type YAMLBlockFolded } from "../types.js";
import type Context from "./context.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockFolded(
  blockFolded: YAMLBlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
