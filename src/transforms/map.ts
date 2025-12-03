import type * as YAML from "yaml";
import { createMapping } from "../factories/mapping.js";
import { createMappingItem } from "../factories/mapping-item.js";
import { createPosition } from "../factories/position.js";
import type { Mapping } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import { getLast } from "../utils/get-last.js";
import type Context from "./context.js";
import { transformPair } from "./pair.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformMap(
  map: YAML.YAMLMap.Parsed,
  context: Context,
  props: TransformNodeProperties,
): Mapping {
  const srcToken = map.srcToken;

  // istanbul ignore next
  if (!srcToken || srcToken.type !== "block-map") {
    throw new Error("Expected block mapping srcToken");
  }

  const mappingItems = map.items.map((pair, index) => {
    const srcItem = srcToken.items[index];

    return transformPair(pair, srcItem, context, createMappingItem);
  });

  if (map.items.length < srcToken.items.length) {
    // Handle extra comments
    for (let i = map.items.length; i < srcToken.items.length; i++) {
      const srcItem = srcToken.items[i];
      for (const token of extractComments(srcItem.start, context)) {
        if (token.type === "comma") {
          // skip
        } else {
          // istanbul ignore next
          throw new Error(
            `Unexpected token type in collection item start: ${token.type}`,
          );
        }
      }
    }
  }

  return createMapping(
    createPosition(
      mappingItems[0].position.start,
      getLast(mappingItems)!.position.end,
    ),
    context.transformContentProperties(map, props.tokens),
    mappingItems,
  );
}
