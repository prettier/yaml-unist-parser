import * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
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
} from "../types.js";
import { transformAlias } from "./alias.js";
import { transformBlockFolded } from "./block-folded.js";
import { transformBlockLiteral } from "./block-literal.js";
import type Context from "./context.js";
import { transformFlowMap } from "./flow-map.js";
import { transformFlowSeq } from "./flow-seq.js";
import { transformMap } from "./map.js";
import { transformPlain } from "./plain.js";
import { transformQuoteDouble } from "./quote-double.js";
import { transformQuoteSingle } from "./quote-single.js";
import { transformSeq } from "./seq.js";

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
    // istanbul ignore next
    throw new Error(`Unexpected scalar type: ${node.type}`);
  }

  // istanbul ignore next
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
