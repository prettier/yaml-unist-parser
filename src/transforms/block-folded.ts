import { createBlockFolded } from "../factories/block-folded.js";
import { Context } from "../transform.js";
import { BlockFolded } from "../types.js";
import * as YAML from "../yaml.js";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockFolded(
  blockFolded: YAML.ast.BlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
