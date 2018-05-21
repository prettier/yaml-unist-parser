import assert = require("assert");
import { Context } from "../transform";
import { SequenceItem } from "../types";
import { cloneObject } from "../utils";
import { transformOffset } from "./offset";

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

  return {
    type: "sequenceItem",
    position: {
      start: transformOffset(seqItem.valueRange!.start, context),
      end:
        value.type === "null"
          ? transformOffset(seqItem.valueRange!.start + 1, context)
          : cloneObject(value.position.end),
    },
    children: [value],
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
