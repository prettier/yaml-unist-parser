import * as YAML from "yaml";
import { createMapping } from "../factories/mapping";
import { createMappingItem } from "../factories/mapping-item";
import { createPosition } from "../factories/position";
import { Context } from "../transform";
import { Mapping } from "../types";
import { createSlicer } from "../utils/create-slicer";
import { extractComments } from "../utils/extract-comments";
import { extractPropComments } from "../utils/extract-prop-comments";
import { getLast } from "../utils/get-last";
import { transformAstPair } from "./pair";

export function transformMap(map: YAML.ast.Map, context: Context): Mapping {
  const cstNode = map.cstNode!;

  cstNode.items
    .filter(item => item.type === "MAP_KEY" || item.type === "MAP_VALUE")
    .forEach(item => extractPropComments(item, context));

  const cstItemsWithoutComments = extractComments(cstNode.items, context);

  const groupedCstItems = groupCstItems(cstItemsWithoutComments);

  const mappingItems = map.items.map((pair, index) => {
    const cstNodes = groupedCstItems[index];
    const [keyRange, valueRange] =
      cstNodes[0].type === "MAP_VALUE"
        ? [null, cstNodes[0].range!]
        : [
            cstNodes[0].range!,
            cstNodes.length === 1 ? null : cstNodes[1].range!,
          ];

    return transformAstPair(
      pair,
      context,
      createMappingItem,
      keyRange,
      valueRange,
    );
  });

  return createMapping(
    createPosition(
      mappingItems[0].position.start,
      getLast(mappingItems)!.position.end,
    ),
    context.transformContent(map),
    mappingItems,
  );
}

function groupCstItems(
  cstItems: Array<Exclude<YAML.cst.Map["items"][number], YAML.cst.Comment>>,
) {
  const groups: Array<typeof cstItems> = [];
  const sliceCstItems = createSlicer(cstItems, 0);

  let hasKey = false;

  for (let i = 0; i < cstItems.length; i++) {
    const cstItem = cstItems[i];

    if (cstItem.type === "MAP_VALUE") {
      groups.push(sliceCstItems(i + 1));
      hasKey = false;
      continue;
    }

    if (hasKey) {
      groups.push(sliceCstItems(i));
    }

    hasKey = true;
  }

  if (hasKey) {
    groups.push(sliceCstItems(Infinity));
  }

  return groups;
}
