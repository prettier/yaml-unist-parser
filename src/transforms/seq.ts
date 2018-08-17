import YAML from "yaml";
import { createPosition } from "../factories/position";
import { createSequence } from "../factories/sequence";
import { createSequenceItem } from "../factories/sequence-item";
import { Context } from "../transform";
import { Sequence } from "../types";
import { extractComments } from "../utils/extract-comments";
import { extractPropComments } from "../utils/extract-prop-comments";
import { getLast } from "../utils/get-last";

export function transformSeq(seq: YAML.ast.Seq, context: Context): Sequence {
  const cstItemsWithoutComments = extractComments(seq.cstNode!.items, context);

  const sequenceItems = cstItemsWithoutComments.map((cstItem, index) => {
    extractPropComments(cstItem, context);
    const item = context.transformNode(seq.items[index]);
    return createSequenceItem(
      createPosition(
        context.transformOffset(cstItem.valueRange!.start),
        item === null
          ? context.transformOffset(cstItem.valueRange!.start + 1)
          : item.position.end,
      ),
      item,
    );
  });

  return createSequence(
    createPosition(
      sequenceItems[0].position.start,
      getLast(sequenceItems)!.position.end,
    ),
    context.transformContent(seq),
    sequenceItems,
  );
}
