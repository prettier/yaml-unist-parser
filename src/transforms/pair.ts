import type * as YAML from "yaml";
import * as YAML_CST from "../cst.js";
import type { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import type { createMappingItem } from "../factories/mapping-item.js";
import { createMappingKey } from "../factories/mapping-key.js";
import { createMappingValue } from "../factories/mapping-value.js";
import { createEmptyPosition, createPosition } from "../factories/position.js";
import type {
  Comment,
  ContentNode,
  Directive,
  Document,
  FlowMappingItem,
  MappingItem,
  Range,
} from "../types.js";
import { extractComments } from "../utils/extract-comments.js";
import type Context from "./context.js";
import { isEmptyNode, type TransformNodeProperties } from "./transform.js";

export function transformPair(
  pair: YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>,
  srcItem: YAML.CST.CollectionItem,
  context: Context,
  createNode: typeof createMappingItem,
): MappingItem;
export function transformPair(
  pair: YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>,
  srcItem: YAML.CST.CollectionItem,
  context: Context,
  createNode: typeof createFlowMappingItem,
): FlowMappingItem;
export function transformPair(
  pair: YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>,
  srcItem: YAML.CST.CollectionItem,
  context: Context,
  createNode: typeof createMappingItem | typeof createFlowMappingItem,
): MappingItem | FlowMappingItem {
  const keyPropTokens: YAML_CST.ContentPropertyToken[] = [];
  let explicitKeyIndToken: YAML_CST.ExplicitKeyIndSourceToken | null = null;
  for (const token of YAML_CST.tokens(srcItem.start)) {
    if (YAML_CST.maybeContentPropertyToken(token)) {
      keyPropTokens.push(token);
      continue;
    }
    if (token.type === "explicit-key-ind") {
      explicitKeyIndToken = token;
      continue;
    }
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

  const valuePropTokens: YAML_CST.ContentPropertyToken[] = [];
  let mapValueIndToken: YAML_CST.MapValueIndSourceToken | null = null;
  for (const token of YAML_CST.tokens(srcItem.sep)) {
    if (YAML_CST.maybeContentPropertyToken(token)) {
      valuePropTokens.push(token);
      continue;
    }
    // istanbul ignore else -- @preserve
    if (token.type === "map-value-ind") {
      mapValueIndToken = token;
      continue;
    }
    // istanbul ignore next -- @preserve
    throw new Error(
      `Unexpected token type in collection item sep: ${token.type}`,
    );
  }

  const keyStartOffset =
    // Has `?` indicator
    explicitKeyIndToken?.offset ??
    // Has key value
    srcItem.key?.offset ??
    // Has `:` indicator
    mapValueIndToken?.offset ??
    // Fallback to value start
    srcItem.value!.offset;
  const keyEndOffset =
    // Has key value
    srcItem.key
      ? pair.key.range![1]
      : // Has `?` indicator
        explicitKeyIndToken
        ? explicitKeyIndToken.offset + explicitKeyIndToken.source.length
        : // Fallback to start of key
          keyStartOffset;
  const keyRange = {
    origStart: keyStartOffset,
    origEnd: keyEndOffset,
  };

  let valueRange: Range | null = null;
  if (pair.value) {
    const valueStartOffset =
      // Has `:` indicator
      mapValueIndToken?.offset ??
      // Has value
      srcItem.value?.offset ??
      // Fallback to AST value start
      pair.value.range![0];
    const valueEndOffset =
      // Has value
      srcItem.value
        ? pair.value.range![1]
        : // Has `:` indicator
          mapValueIndToken
          ? mapValueIndToken.offset + mapValueIndToken.source.length
          : // Fallback to start of value
            valueStartOffset;
    valueRange = {
      origStart: valueStartOffset,
      origEnd: valueEndOffset,
    };
  }

  return transformAstPair(
    pair,
    context,
    createNode,
    { range: keyRange, props: { tokens: keyPropTokens } },
    { range: valueRange, props: { tokens: valuePropTokens } },
  );
}

function transformAstPair(
  pair: YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>,
  context: Context,
  createNode: typeof createMappingItem | typeof createFlowMappingItem,
  additionalKeyData: { range: Range; props: TransformNodeProperties },
  additionalValueData: { range: null | Range; props: TransformNodeProperties },
): MappingItem | FlowMappingItem {
  let keyContent: ContentNode | null = null;
  if (!isEmptyNode(pair.key, additionalKeyData.props)) {
    keyContent = context.transformNode(pair.key, additionalKeyData.props);
  } else {
    extractComments(additionalKeyData.props.tokens, context);
  }

  let valueContent: ContentNode | null = null;
  if (!isEmptyNode(pair.value, additionalValueData.props)) {
    valueContent = context.transformNode(pair.value, additionalValueData.props);
  } else {
    extractComments(additionalValueData.props.tokens, context);
  }

  const mappingKey = createMappingKey(
    context.transformRange({
      origStart: additionalKeyData.range
        ? additionalKeyData.range.origStart
        : keyContent!.position.start.offset,
      origEnd: keyContent
        ? keyContent.position.end.offset
        : additionalKeyData.range!.origEnd,
    }),
    keyContent as Exclude<typeof keyContent, Comment | Directive | Document>,
  );

  const mappingValue =
    valueContent || additionalValueData.range
      ? createMappingValue(
          context.transformRange({
            origStart: additionalValueData.range
              ? additionalValueData.range.origStart
              : // istanbul ignore next -- @preserve
                valueContent!.position.start.offset,
            origEnd: valueContent
              ? valueContent.position.end.offset
              : additionalValueData.range!.origStart + 1,
          }),
          valueContent as Exclude<
            typeof valueContent,
            Comment | Directive | Document
          >,
        )
      : null;

  return createNode(
    createPosition(
      mappingKey.position.start,
      mappingValue ? mappingValue.position.end : mappingKey.position.end,
    ),
    mappingKey,
    mappingValue ||
      createMappingValue(createEmptyPosition(mappingKey.position.end), null),
  );
}
