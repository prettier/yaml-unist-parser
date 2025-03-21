import type * as YAML from "yaml";
import type * as YAMLTypes from "yaml/types";
import type {
  Alias,
  BlockFolded,
  BlockLiteral,
  Comment,
  Directive,
  Document,
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
import { transformComment } from "./comment.js";
import type Context from "./context.js";
import { transformDirective } from "./directive.js";
import { transformDocument } from "./document.js";
import { transformFlowMap } from "./flow-map.js";
import { transformFlowSeq } from "./flow-seq.js";
import { transformMap } from "./map.js";
import { transformPlain } from "./plain.js";
import { transformQuoteDouble } from "./quote-double.js";
import { transformQuoteSingle } from "./quote-single.js";
import { transformSeq } from "./seq.js";

export type YamlNode =
  | null
  | YAMLTypes.Alias
  | YAML.CST.BlankLine
  | YAML.AST.BlockFolded
  | YAML.AST.BlockLiteral
  | YAML.CST.Comment
  | YAML.CST.Directive
  | YAML.Document
  | YAML.AST.FlowMap
  | YAML.AST.FlowSeq
  | YAML.AST.BlockMap
  | YAML.AST.PlainValue
  | YAML.AST.QuoteDouble
  | YAML.AST.QuoteSingle
  | YAMLTypes.Scalar
  | YAML.AST.BlockSeq;

// prettier-ignore
export type YamlToUnist<T extends YamlNode> =
  T extends null ? null :
  T extends YAMLTypes.Alias ? Alias :
  T extends YAML.AST.BlockFolded ? BlockFolded :
  T extends YAML.AST.BlockLiteral ? BlockLiteral :
  T extends YAML.CST.Comment ? Comment :
  T extends YAML.CST.Directive ? Directive :
  T extends YAML.Document ? Document :
  T extends YAML.AST.FlowMap ? FlowMapping :
  T extends YAML.AST.FlowSeq ? FlowSequence :
  T extends YAML.AST.BlockMap ? Mapping :
  T extends YAML.AST.PlainValue ? Plain :
  T extends YAML.AST.QuoteDouble ? QuoteDouble :
  T extends YAML.AST.QuoteSingle ? QuoteSingle :
  T extends YAML.AST.BlockSeq ? Sequence :
  never;

export function transformNode<T extends YamlNode>(
  node: T,
  context: Context,
): YamlToUnist<T>;
export function transformNode(
  node: YamlNode,
  context: Context,
): YamlUnistNode | null {
  if (node === null || (node.type === undefined && node.value === null)) {
    return null;
  }

  switch (node.type) {
    case "ALIAS":
      return transformAlias(node, context);
    case "BLOCK_FOLDED":
      return transformBlockFolded(node as YAML.AST.BlockFolded, context);
    case "BLOCK_LITERAL":
      return transformBlockLiteral(node as YAML.AST.BlockLiteral, context);
    case "COMMENT":
      return transformComment(node, context);
    case "DIRECTIVE":
      return transformDirective(node, context);
    case "DOCUMENT":
      return transformDocument(node, context);
    case "FLOW_MAP":
      return transformFlowMap(node, context);
    case "FLOW_SEQ":
      return transformFlowSeq(node, context);
    case "MAP":
      return transformMap(node, context);
    case "PLAIN":
      return transformPlain(node as YAML.AST.PlainValue, context);
    case "QUOTE_DOUBLE":
      return transformQuoteDouble(node as YAML.AST.QuoteDouble, context);
    case "QUOTE_SINGLE":
      return transformQuoteSingle(node as YAML.AST.QuoteSingle, context);
    case "SEQ":
      return transformSeq(node, context);
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}
