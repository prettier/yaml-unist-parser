import * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import type {
  Alias,
  BlockFolded,
  BlockLiteral,
  FlowMapping,
  FlowSequence,
  Mapping,
  Plain,
  QuoteDouble,
  QuoteSingle,
  Sequence,
  YamlUnistNode,
} from "../types.ts";
import { transformAlias } from "./alias.ts";
import { transformBlockFolded } from "./block-folded.ts";
import { transformBlockLiteral } from "./block-literal.ts";
import type Context from "./context.ts";
import { transformFlowMap } from "./flow-map.ts";
import { transformFlowSeq } from "./flow-seq.ts";
import { transformMap } from "./map.ts";
import { transformPlain } from "./plain.ts";
import { transformQuoteDouble } from "./quote-double.ts";
import { transformQuoteSingle } from "./quote-single.ts";
import { transformSeq } from "./seq.ts";

export type YamlNode = null | YAML.ParsedNode;

// prettier-ignore
export type YamlToUnist<T extends YamlNode> =
  T extends null ? null :
  T extends YAML.Alias.Parsed ? Alias :
  T extends YAML.YAMLMap.Parsed ? (Mapping | FlowMapping) :
  T extends YAML.YAMLSeq.Parsed ? (Sequence | FlowSequence) :
  T extends YAML.Scalar.Parsed ? (BlockLiteral | BlockFolded | Plain | QuoteSingle | QuoteDouble) :
  never;

export type TransformNodeProperties = {
  tokens: YAML_CST.ContentPropertyToken[];
};

export function transformNode<T extends YamlNode>(
  node: T,
  context: Context,
  props: TransformNodeProperties,
): YamlToUnist<T>;
export function transformNode(
  node: YamlNode,
  context: Context,
  props: TransformNodeProperties,
): YamlUnistNode | null {
  if (node == null) {
    return null;
  }
  if (YAML.isAlias(node)) {
    return transformAlias(node, context, props);
  }
  if (YAML.isMap(node)) {
    if (node.flow) {
      return transformFlowMap(node, context, props);
    }
    return transformMap(node, context, props);
  }
  if (YAML.isSeq(node)) {
    if (node.flow) {
      return transformFlowSeq(node, context, props);
    }
    return transformSeq(node, context, props);
  }
  if (YAML.isScalar(node)) {
    switch (node.type!) {
      case "BLOCK_FOLDED":
        return transformBlockFolded(node, context, props);
      case "BLOCK_LITERAL":
        return transformBlockLiteral(node, context, props);
      case "PLAIN":
        return transformPlain(node, context, props);
      case "QUOTE_DOUBLE":
        return transformQuoteDouble(node, context, props);
      case "QUOTE_SINGLE":
        return transformQuoteSingle(node, context, props);
    }
    // istanbul ignore next -- @preserve
    throw new Error(`Unexpected scalar type: ${node.type}`);
  }

  // istanbul ignore next -- @preserve
  throw new Error(`Unexpected unknown node type`);
}

export function isEmptyNode(
  node: YAML.ParsedNode | null,
  props: TransformNodeProperties,
) {
  return (
    !node ||
    (node.range[0] === node.range[1] &&
      props.tokens.every(t => t.type === "comment"))
  );
}
