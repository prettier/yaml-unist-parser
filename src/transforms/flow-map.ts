import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createFlowMapping } from "../factories/flow-mapping.ts";
import { createFlowMappingItem } from "../factories/flow-mapping-item.ts";
import type { FlowMapping } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import type Context from "./context.ts";
import { transformPair } from "./pair.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformFlowMap(
  flowMap: YAML.YAMLMap.Parsed,
  context: Context,
  props: TransformNodeProperties,
): FlowMapping {
  const srcToken = flowMap.srcToken;

  // istanbul ignore if -- @preserve
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
        // istanbul ignore else -- @preserve
        if (token.type === "comma") {
          // skip
          continue;
        }

        // istanbul ignore next -- @preserve
        throw new Error(
          `Unexpected token type in collection item start: ${token.type}`,
        );
      }
    }
  }

  let flowMapEndToken: YAML_CST.FlowMapEndSourceToken | null = null;
  for (const token of extractComments(srcToken.end, context)) {
    // istanbul ignore else -- @preserve
    if (token.type === "flow-map-end") {
      flowMapEndToken = token;
      continue;
    }

    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type in flow map end: ${token.type}`);
  }

  // istanbul ignore if -- @preserve
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
