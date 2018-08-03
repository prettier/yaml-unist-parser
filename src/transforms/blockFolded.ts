import assert = require("assert");
import YAML from "yaml";
import { createBlockFolded } from "../factories/block-folded";
import { Context } from "../transform";
import { BlockFolded } from "../types";
import { tranformBlockValue } from "./blockValue";

export function tranformBlockFolded(
  blockFolded: YAML.cst.BlockValue,
  context: Context,
): BlockFolded {
  assert(blockFolded.type === "BLOCK_FOLDED");
  return createBlockFolded(tranformBlockValue(blockFolded, context));
}
