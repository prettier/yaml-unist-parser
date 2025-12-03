import type * as YAML from "yaml";
import { createMapping } from "../factories/mapping.ts";
import { createMappingItem } from "../factories/mapping-item.ts";
import { createPosition } from "../factories/position.ts";
import type { Mapping } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import { getLast } from "../utils/get-last.ts";
import type Context from "./context.ts";
import { transformPair } from "./pair.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformMap(
  map: YAML.YAMLMap.Parsed,
  context: Context,
  props: TransformNodeProperties,
): Mapping {
  const srcToken = map.srcToken;

  // istanbul ignore if -- @preserve
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
        // istanbul ignore next -- @preserve
        throw new Error(
          `Unexpected token type in collection item start: ${token.type}`,
        );
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
