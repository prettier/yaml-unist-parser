import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createFlowMapping } from "../factories/flow-mapping.js";
import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import type { FlowMapping } from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import type Context from "./context.js";
import { transformPair } from "./pair.js";
import type { TransformNodeProperties } from "./transform.js";

export function transformFlowMap(
  flowMap: YAML.YAMLMap.Parsed,
  context: Context,
  props: TransformNodeProperties,
): FlowMapping {
  const srcToken = flowMap.srcToken;

  // istanbul ignore next
  if (!srcToken || srcToken.type !== "flow-collection") {
    throw new Error("Expected flow-collection CST node for flow map");
  }

  const flowMappingItems = flowMap.items.map((pair, index) => {
    const srcItem = srcToken.items[index];

    return transformPair(pair, srcItem, context, createFlowMappingItem);
  });

  if (flowMap.items.length < srcToken.items.length) {
    // Handle extra comments
    for (let i = flowMap.items.length; i < srcToken.items.length; i++) {
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

  let flowMapEndToken: YAML_CST.FlowMapEndSourceToken | null = null;
  for (const token of extractComments(srcToken.end, context)) {
    if (token.type === "flow-map-end") {
      flowMapEndToken = token;
    } else {
      // istanbul ignore next
      throw new Error(`Unexpected token type in flow map end: ${token.type}`);
    }
  }
  if (!flowMapEndToken) {
    throw new Error("Expected flow-map-end token");
  }

  return createFlowMapping(
    context.transformRange({
      origStart: srcToken.start.offset,
      origEnd: flowMapEndToken.offset + flowMapEndToken.source.length,
    }),
    context.transformContentProperties(flowMap, props.tokens),
    flowMappingItems,
  );
}
