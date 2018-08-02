import assert = require("assert");
import { createPosition } from "../factories/position";
import { createSequenceItem } from "../factories/sequence-item";
import { Context } from "../transform";
import { SequenceItem } from "../types";

export function transformSeqItem(
  seqItem: yaml.SeqItem,
  context: Context,
): SequenceItem {
  assert(seqItem.valueRange !== null);
  assert(seqItem.node === null || seqItem.node.type !== "COMMENT");

  const value = context.transformNode(seqItem.node as Exclude<
    typeof seqItem.node,
    yaml.Comment
  >);

  return createSequenceItem(
    createPosition(
      context.transformOffset(seqItem.valueRange!.start),
      value === null
        ? context.transformOffset(seqItem.valueRange!.start + 1)
        : value.position.end,
    ),
    value,
  );
}
