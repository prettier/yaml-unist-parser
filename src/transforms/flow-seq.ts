import * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import { createFlowMappingItem } from "../factories/flow-mapping-item.ts";
import { createFlowSequence } from "../factories/flow-sequence.ts";
import { createFlowSequenceItem } from "../factories/flow-sequence-item.ts";
import { createPosition } from "../factories/position.ts";
import type { FlowSequence } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import { getLast } from "../utils/get-last.ts";
import type Context from "./context.ts";
import { transformPair } from "./pair.ts";
import type { TransformNodeProperties } from "./transform.ts";

export function transformFlowSeq(
  flowSeq: YAML.YAMLSeq.Parsed<
    YAML.ParsedNode | YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>
  >,
  context: Context,
  props: TransformNodeProperties,
): FlowSequence {
  const srcToken = flowSeq.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "flow-collection") {
    throw new Error("Expected flow-collection CST node for flow sequence");
  }

  const flowSequenceItems = flowSeq.items.map((item, index) => {
    const srcItem = srcToken.items[index];

    if (isBlockMappingOfImmediateChildOfFlowSequence(item, srcItem)) {
      const pair = getLast(item.items)!;
      return transformPair(pair, srcItem, context, createFlowMappingItem);
    }

    if (!YAML.isPair(item)) {
      const propTokens: YAML_CST.ContentPropertyToken[] = [];
      for (const token of YAML_CST.tokens(srcItem.start)) {
        if (YAML_CST.maybeContentPropertyToken(token)) {
          propTokens.push(token);
          continue;
        }
        // istanbul ignore else -- @preserve
        if (token.type === "comma") {
          // skip
          continue;
        }

        // istanbul ignore next -- @preserve
        throw new Error(
          `Unexpected token type in sequence item start: ${token.type}`,
        );
      }
      const node = context.transformNode(item, { tokens: propTokens });
      return createFlowSequenceItem(
        createPosition(node.position.start, node.position.end),
        node,
      );
    } else {
      return transformPair(item, srcItem, context, createFlowMappingItem);
    }
  });

  if (flowSeq.items.length < srcToken.items.length) {
    // Handle extra comments
    for (let i = flowSeq.items.length; i < srcToken.items.length; i++) {
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

  let flowSeqEndToken: YAML_CST.FlowSeqEndSourceToken | null = null;
  for (const token of YAML_CST.tokens(srcToken.end)) {
    if (token.type === "comment") {
      context.transformComment(token);
      continue;
    }

    // istanbul ignore else -- @preserve
    if (token.type === "flow-seq-end") {
      flowSeqEndToken = token;
      continue;
    }

    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected token type in flow seq end: ${token.type}`);
  }

  // istanbul ignore if -- @preserve
  if (!flowSeqEndToken) {
    throw new Error("Expected flow-seq-end token");
  }

  return createFlowSequence(
    context.transformRange({
      origStart: srcToken.start.offset,
      origEnd: flowSeqEndToken.offset + flowSeqEndToken.source.length,
    }),
    context.transformContentProperties(flowSeq, props.tokens),
    flowSequenceItems,
  );
}

/**
 * Checks whether the given item is a block mapping that is an immediate child of a flow sequence.
 * This is determined by checking if the item does not have a source token and contains exactly one item.
 *
 * e.g.
 *
 * ```yaml
 * [ key: value ]
 * ```
 */
function isBlockMappingOfImmediateChildOfFlowSequence(
  item: YAML.ParsedNode | YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>,
  srcItem: YAML.CST.CollectionItem,
): item is YAML.YAMLMap.Parsed & {
  items: [YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>];
} {
  if (item.srcToken) {
    // If the item has a source token, it is not a block mapping immediate child of a flow sequence
    // because it is associated with a source token indicating it is not an immediate child.
    return false;
  }

  // istanbul ignore if -- @preserve
  if (!YAML.isMap(item)) return false;

  // istanbul ignore if -- @preserve
  if (item.items.length !== 1) {
    // If the block mapping does not contain exactly one item, it is not considered
    // an immediate child of a flow sequence.
    return false;
  }

  const child = item.items[0];
  return child.srcToken === srcItem;
}
