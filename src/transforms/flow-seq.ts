import * as YAML from "yaml";
import { createFlowMappingItem } from "../factories/flow-mapping-item";
import { createFlowSequence } from "../factories/flow-sequence";
import { createFlowSequenceItem } from "../factories/flow-sequence-item";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { FlowSequence } from "../types";
import { extractComments } from "../utils/extract-comments";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges";
import { getLast } from "../utils/get-last";
import { groupCstFlowCollectionItems } from "../utils/group-cst-flow-collection-items";
import { transformAstPair } from "./pair";

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
      const node = context.transformNode(item);
      return createFlowSequenceItem(
        createPosition(node.position.start, node.position.end),
        node,
      );
    } else {
      const cstNodes = groupedCstItems[index];

      const {
        additionalKeyRange,
        additionalValueRange,
      } = getFlowMapItemAdditionalRanges(cstNodes);

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
