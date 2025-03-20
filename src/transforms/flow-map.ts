import type YAML from "yaml";

import { createFlowMapping } from "../factories/flow-mapping.js";
import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import type Context from "./context.js";
import { type FlowMapping } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges.js";
import { getLast } from "../utils/get-last.js";
import {
  type CstFlowMapItemWithoutComment,
  groupCstFlowCollectionItems,
} from "../utils/group-cst-flow-collection-items.js";
import { transformAstPair } from "./pair.js";

export function transformFlowMap(
  flowMap: YAML.CST.BlockMap,
  context: Context,
): FlowMapping {
  const cstItemsWithoutComments = extractComments<CstFlowMapItemWithoutComment>(
    flowMap!.items,
    context,
  );

  const groupedCstItems = groupCstFlowCollectionItems(cstItemsWithoutComments);

  const flowMappingItems = flowMap.items.map((pair, index) => {
    const cstNodes = groupedCstItems[index];

    const { additionalKeyRange, additionalValueRange } =
      getFlowMapItemAdditionalRanges(cstNodes);

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
