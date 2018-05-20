import assert = require("assert");
import { Context } from "../transform";
import { Sequence, SequenceItem } from "../types";
import { cloneObject, getLast } from "../utils";
import { transformComment } from "./comment";
import { transformOffset } from "./offset";

export function transformSeq(seq: yaml.Seq, context: Context): Sequence {
  const itemsWithoutComments = seq.items.filter(item => {
    if (item.type === "COMMENT") {
      context.comments.push(transformComment(item, context));
      return false;
    }
    return true;
  }) as yaml.SeqItem[];

  const sequenceItems = itemsWithoutComments.map((item): SequenceItem => {
    assert(item.valueRange !== null);
    assert(item.node === null || item.node.type !== "COMMENT");

    const node = context.transformNode(item.node as Exclude<
      typeof item.node,
      yaml.Comment
    >);
    return {
      type: "sequenceItem",
      position: {
        start: transformOffset(item.valueRange!.start, context),
        end:
          node.type === "null"
            ? transformOffset(item.valueRange!.start + 1, context)
            : cloneObject(node.position.end),
      },
      children: [node],
      leadingComments: [],
      middleComments: [],
      trailingComments: [],
    };
  });

  assert(seq.valueRange !== null);

  return {
    type: "sequence",
    position: cloneObject({
      start: sequenceItems[0].position.start,
      end: getLast(sequenceItems)!.position.end,
    }),
    children: sequenceItems,
    leadingComments: [],
    middleComments: [],
    trailingComments: [],
  };
}
