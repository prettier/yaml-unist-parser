import { createBlockFolded } from "../factories/block-folded.js";
import type Context from "./context.js";
import { type BlockFolded } from "../types.js";
import type * as YAML from "yaml";
import { transformAstBlockValue } from "./block-value.js";

export function transformBlockFolded(
  blockFolded: YAML.AST.BlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
