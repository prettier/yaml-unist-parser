import YAML from "yaml";

import { createPosition } from "../factories/position.js";
import { createSequence } from "../factories/sequence.js";
import { createSequenceItem } from "../factories/sequence-item.js";
import { Context, YamlNode } from "../transform.js";
import { ContentNode, Sequence } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";
import { getLast } from "../utils/get-last.js";

export function transformSeq(
  seq: YAML.YAMLSeq<YAML.Node>,
  context: Context,
): Sequence {
  const cstItemsWithoutComments = extractComments(seq.items, context);

  const sequenceItems = cstItemsWithoutComments.map((cstItem, index) => {
    extractPropComments(cstItem, context);
    const item = context.transformNode(seq.items[index] as YamlNode);
    return createSequenceItem(
      createPosition(
        context.transformOffset(cstItem.range![0]),
        item === null
          ? context.transformOffset(cstItem.range![0] + 1)
          : item.position.end,
      ),
      item as ContentNode,
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
