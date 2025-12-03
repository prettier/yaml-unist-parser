import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import type { createFlowMappingItem } from "../factories/flow-mapping-item.ts";
import type { createMappingItem } from "../factories/mapping-item.ts";
import { createMappingKey } from "../factories/mapping-key.ts";
import { createMappingValue } from "../factories/mapping-value.ts";
import { createEmptyPosition, createPosition } from "../factories/position.ts";
import type {
  Comment,
  ContentNode,
  Directive,
  Document,
  FlowMappingItem,
  MappingItem,
  Range,
} from "../types.ts";
import { extractComments } from "../utils/extract-comments.ts";
import type Context from "./context.ts";
import { isEmptyNode, type TransformNodeProperties } from "./transform.ts";

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
  const keyRange: Range = [keyStartOffset, keyEndOffset];

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
    valueRange = [valueStartOffset, valueEndOffset];
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
    context.transformRange([
      additionalKeyData.range
        ? additionalKeyData.range[0]
        : keyContent!.position.start.offset,
      keyContent ? keyContent.position.end.offset : additionalKeyData.range![1],
    ]),
    keyContent as Exclude<typeof keyContent, Comment | Directive | Document>,
  );

  const mappingValue =
    valueContent || additionalValueData.range
      ? createMappingValue(
          context.transformRange([
            additionalValueData.range
              ? additionalValueData.range[0]
              : // istanbul ignore next -- @preserve
                valueContent!.position.start.offset,
            valueContent
              ? valueContent.position.end.offset
              : additionalValueData.range![0] + 1,
          ]),
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
