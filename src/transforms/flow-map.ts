import { createFlowMapping } from "../factories/flow-mapping";
import { createFlowMappingItem } from "../factories/flow-mapping-item";
import { Context } from "../transform";
import { FlowMapping } from "../types";
import { extractComments } from "../utils/extract-comments";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges";
import { getLast } from "../utils/get-last";
import { groupCstFlowCollectionItems } from "../utils/group-cst-flow-collection-items";
import * as YAML from "../yaml";
import { transformAstPair } from "./pair";

export function transformFlowMap(
  flowMap: YAML.ast.FlowMap,
  context: Context,
): FlowMapping {
  const cstItemsWithoutComments = extractComments(
    flowMap.cstNode!.items,
    context,
  );

  const groupedCstItems = groupCstFlowCollectionItems(cstItemsWithoutComments);

  const flowMappingItems = flowMap.items.map((pair, index) => {
    const cstNodes = groupedCstItems[index];

    const {
      additionalKeyRange,
      additionalValueRange,
    } = getFlowMapItemAdditionalRanges(cstNodes);

    return transformAstPair(
      pair,
      context,
      createFlowMappingItem,
      additionalKeyRange,
      additionalValueRange,
    );
  });

  const openMarker = cstItemsWithoutComments[0] as YAML.cst.FlowChar;
  const closeMarker = getLast(cstItemsWithoutComments) as YAML.cst.FlowChar;

  return createFlowMapping(
    context.transformRange({
      origStart: openMarker.origOffset,
      origEnd: closeMarker.origOffset + 1,
    }),
    context.transformContent(flowMap),
    flowMappingItems,
  );
}
