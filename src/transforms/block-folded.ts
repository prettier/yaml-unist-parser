import { createBlockFolded } from "../factories/block-folded.js";
import type Context from "./context.js";
import { type BlockFolded } from "../types.js";
import type * as YAML from "../yaml.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockFolded(
  blockFolded: YAML.ast.BlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
