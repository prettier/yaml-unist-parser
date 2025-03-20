import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import { createFlowSequence } from "../factories/flow-sequence.js";
import { createFlowSequenceItem } from "../factories/flow-sequence-item.js";
import { createPosition } from "../factories/position.js";
import type Context from "./context.js";
import { type FlowSequence } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges.js";
import { getLast } from "../utils/get-last.js";
import { groupCstFlowCollectionItems } from "../utils/group-cst-flow-collection-items.js";
import type * as YAML from "../yaml.js";
import { transformAstPair } from "./pair.js";

export function transformFlowSeq(
  flowSeq: YAML.ast.FlowSeq,
  context: Context,
): FlowSequence {
  const cstItemsWithoutComments = extractComments(
    flowSeq.cstNode!.items,
    context,
  );

  const groupedCstItems = groupCstFlowCollectionItems(cstItemsWithoutComments);

  const flowSequenceItems = flowSeq.items.map((item, index) => {
    if (item.type !== "PAIR") {
      const node = context.transformNode(
        item as Exclude<typeof item, YAML.ast.Pair>,
      );
      return createFlowSequenceItem(
        createPosition(node.position.start, node.position.end),
        node,
      );
    } else {
      const cstNodes = groupedCstItems[index];

      const { additionalKeyRange, additionalValueRange } =
        getFlowMapItemAdditionalRanges(cstNodes);

      return transformAstPair(
        item,
        context,
        createFlowMappingItem,
        additionalKeyRange,
        additionalValueRange,
      );
    }
  });

  const openMarker = cstItemsWithoutComments[0] as YAML.cst.FlowChar;
  const closeMarker = getLast(cstItemsWithoutComments) as YAML.cst.FlowChar;

  return createFlowSequence(
    context.transformRange({
      origStart: openMarker.origOffset,
      origEnd: closeMarker.origOffset + 1,
    }),
    context.transformContent(flowSeq),
    flowSequenceItems,
  );
}
