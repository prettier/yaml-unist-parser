import assert = require("assert");
import YAML from "yaml";
import { createPosition } from "../factories/position";
import { createSequence } from "../factories/sequence";
import { Context } from "../transform";
import { Sequence } from "../types";
import { getLast } from "../utils";

export function transformSeq(seq: YAML.cst.Seq, context: Context): Sequence {
  const itemsWithoutComments = seq.items.filter(item => {
    if (item.type === "COMMENT") {
      context.comments.push(context.transformNode(item));
      return false;
    }
    return true;
  }) as YAML.cst.SeqItem[];

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
