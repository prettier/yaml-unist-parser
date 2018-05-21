import assert = require("assert");
import { Context } from "../transform";
import { Sequence } from "../types";
import { cloneObject, getLast } from "../utils";

export function transformSeq(seq: yaml.Seq, context: Context): Sequence {
  const itemsWithoutComments = seq.items.filter(item => {
    if (item.type === "COMMENT") {
      context.comments.push(context.transformNode(item));
      return false;
    }
    return true;
  }) as yaml.SeqItem[];

  const sequenceItems = itemsWithoutComments.map(context.transformNode);

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
