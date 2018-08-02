import { BlockFolded, BlockValue } from "../types";

export function createBlockFolded(blockValue: BlockValue): BlockFolded {
  return {
    ...blockValue,
    type: "blockFolded",
  };
}
