import * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import { createMapping } from "../factories/mapping.ts";
import { createMappingItem } from "../factories/mapping-item.ts";
import { createPosition } from "../factories/position.ts";
import { createSequence } from "../factories/sequence.ts";
import { createSequenceItem } from "../factories/sequence-item.ts";
import type { Sequence } from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import { getLast } from "../utils/get-last.ts";
import type Context from "./context.ts";
import { transformPair } from "./pair.ts";
import { isEmptyNode, type TransformNodeProperties } from "./transform.ts";

type ItemNode =
  | YAML.ParsedNode
  | YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>;
export function transformSeq(
  seq: YAML.YAMLSeq.Parsed<ItemNode>,
  context: Context,
  props: TransformNodeProperties,
): Sequence {
  const srcToken = seq.srcToken;

  // istanbul ignore if -- @preserve
  if (!srcToken || srcToken.type !== "block-seq") {
    throw new Error("Expected block sequence srcToken");
  }

  const sequenceItems = seq.items.map((itemNode, index) => {
    const srcItem = srcToken.items[index];
    const propTokens: YAML_CST.ContentPropertyToken[] = [];
    let seqItemIndToken: YAML_CST.SeqItemIndSourceToken | null = null;
    for (const token of YAML_CST.tokens(srcItem.start)) {
      if (YAML_CST.maybeContentPropertyToken(token)) {
        propTokens.push(token);
        continue;
      }

      // istanbul ignore else -- @preserve
      if (token.type === "seq-item-ind") {
        seqItemIndToken = token;
        continue;
      }
      // istanbul ignore next -- @preserve
      throw new Error(
        `Unexpected token type in sequence item start: ${token.type}`,
      );
    }

    const item = transformItemValue(itemNode, context, { tokens: propTokens });

    return createSequenceItem(
      createPosition(
        seqItemIndToken
          ? context.transformOffset(seqItemIndToken.offset)
          : item!.position.start,
        item?.position.end ??
          context.transformOffset(
            seqItemIndToken!.offset + seqItemIndToken!.source.length,
          ),
      ),
      item,
    );
  });

  if (seq.items.length < srcToken.items.length) {
    // Handle extra comments
    for (let i = seq.items.length; i < srcToken.items.length; i++) {
      const srcItem = srcToken.items[i];
      for (const token of extractComments(srcItem.start, context)) {
        // istanbul ignore next -- @preserve
        throw new Error(
          `Unexpected token type in collection item start: ${token.type}`,
        );
      }
    }
  }

  return createSequence(
    createPosition(
      sequenceItems[0].position.start,
      getLast(sequenceItems)!.position.end,
    ),
    context.transformContentProperties(seq, props.tokens),
    sequenceItems,
  );
}

function transformItemValue(
  itemNode: ItemNode,
  context: Context,
  props: TransformNodeProperties,
) {
  if (!YAML.isPair(itemNode)) {
    if (isEmptyNode(itemNode, props)) {
      extractComments(props.tokens, context);
      return null;
    }
    return context.transformNode(itemNode, props);
  }

  const srcItem = itemNode.srcToken!;
  const mappingItem = transformPair(
    itemNode,
    srcItem,
    context,
    createMappingItem,
  );

  return createMapping(
    mappingItem.position,
    context.transformContentProperties(itemNode.key, props.tokens),
    [mappingItem],
  );
}
