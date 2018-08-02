import assert = require("assert");
import { createBlockFolded } from "../factories/block-folded";
import { Context } from "../transform";
import { BlockFolded } from "../types";
import { tranformBlockValue } from "./blockValue";

export function tranformBlockFolded(
  blockFolded: yaml.BlockValue,
  context: Context,
): BlockFolded {
  assert(blockFolded.type === "BLOCK_FOLDED");
  return createBlockFolded(tranformBlockValue(blockFolded, context));
}
