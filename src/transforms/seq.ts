import assert = require("assert");
import { createPosition } from "../factories/position";
import { createSequence } from "../factories/sequence";
import { Context } from "../transform";
import { Sequence } from "../types";
import { getLast } from "../utils";

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

  return createSequence(
    createPosition(
      sequenceItems[0].position.start,
      getLast(sequenceItems)!.position.end,
    ),
    sequenceItems,
  );
}
