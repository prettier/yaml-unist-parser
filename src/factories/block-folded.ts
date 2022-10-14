import { BlockFolded, BlockValue } from "../types.js";

export function createBlockFolded(blockValue: BlockValue): BlockFolded {
  return {
    ...blockValue,
    type: "blockFolded",
  };
}
