import * as YAML from "yaml";
import { createBlockFolded } from "../factories/block-folded";
import { Context } from "../transform";
import { BlockFolded } from "../types";
import { transformAstBlockValue } from "./block-value";

export function transformBlockFolded(
  blockFolded: YAML.ast.BlockFolded,
  context: Context,
): BlockFolded {
  return createBlockFolded(transformAstBlockValue(blockFolded, context));
}
