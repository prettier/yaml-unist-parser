import { LinesAndColumns } from "lines-and-columns";
import { transformAlias } from "./transforms/alias";
import { transformBlockFolded } from "./transforms/block-folded";
import { transformBlockLiteral } from "./transforms/block-literal";
import { transformComment } from "./transforms/comment";
import { transformDirective } from "./transforms/directive";
import { transformDocument } from "./transforms/document";
import { transformFlowMap } from "./transforms/flow-map";
import { transformFlowSeq } from "./transforms/flow-seq";
import { transformMap } from "./transforms/map";
import { transformPlain } from "./transforms/plain";
import { transformQuoteDouble } from "./transforms/quote-double";
import { transformQuoteSingle } from "./transforms/quote-single";
import { Range } from "./transforms/range";
import { transformSeq } from "./transforms/seq";
import {
  Alias,
  BlockFolded,
  BlockLiteral,
  Comment,
  Content,
  Directive,
  Document,
  FlowMapping,
  FlowSequence,
  Mapping,
  Plain,
  Point,
  Position,
  QuoteDouble,
  QuoteSingle,
  Sequence,
  YamlUnistNode,
} from "./types";
import * as YAML from "./yaml";

export type YamlNode =
  | null
  | YAML.ast.Alias
  | YAML.cst.BlankLine
  | YAML.ast.BlockFolded
  | YAML.ast.BlockLiteral
  | YAML.cst.Comment
  | YAML.cst.Directive
  | YAML.ast.Document
  | YAML.ast.FlowMap
  | YAML.ast.FlowSeq
  | YAML.ast.Map
  | YAML.ast.PlainValue
  | YAML.ast.QuoteDouble
  | YAML.ast.QuoteSingle
  | YAML.ast.Scalar
  | YAML.ast.Seq;

// prettier-ignore
export type YamlToUnist<T extends YamlNode> =
  T extends null ? null :
  T extends YAML.ast.Alias ? Alias :
  T extends YAML.ast.BlockFolded ? BlockFolded :
  T extends YAML.ast.BlockLiteral ? BlockLiteral :
  T extends YAML.cst.Comment ? Comment :
  T extends YAML.cst.Directive ? Directive :
  T extends YAML.ast.Document ? Document :
  T extends YAML.ast.FlowMap ? FlowMapping :
  T extends YAML.ast.FlowSeq ? FlowSequence :
  T extends YAML.ast.Map ? Mapping :
  T extends YAML.ast.PlainValue ? Plain :
  T extends YAML.ast.QuoteDouble ? QuoteDouble :
  T extends YAML.ast.QuoteSingle ? QuoteSingle :
  T extends YAML.ast.Seq ? Sequence :
  never;

export interface Context {
  text: string;
  locator: LinesAndColumns;
  comments: Comment[];
  transformOffset: (offset: number) => Point;
  transformRange: (range: Range) => Position;
  transformNode: <T extends YamlNode>(node: T) => YamlToUnist<T>;
  transformContent: (node: YAML.ast.Node) => Content;
}

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

  // prettier-ignore
  switch (node.type) {
    case "ALIAS": return transformAlias(node, context);
    case "BLOCK_FOLDED": return transformBlockFolded(node as YAML.ast.BlockFolded, context);
    case "BLOCK_LITERAL": return transformBlockLiteral(node as YAML.ast.BlockLiteral, context);
    case "COMMENT": return transformComment(node, context);
    case "DIRECTIVE": return transformDirective(node, context);
    case "DOCUMENT": return transformDocument(node, context);
    case "FLOW_MAP": return transformFlowMap(node, context);
    case "FLOW_SEQ": return transformFlowSeq(node, context);
    case "MAP": return transformMap(node, context);
    case "PLAIN": return transformPlain(node as YAML.ast.PlainValue, context);
    case "QUOTE_DOUBLE": return transformQuoteDouble(node as YAML.ast.QuoteDouble, context);
    case "QUOTE_SINGLE": return transformQuoteSingle(node as YAML.ast.QuoteSingle, context);
    case "SEQ": return transformSeq(node, context);
    // istanbul ignore next
    default: throw new Error(`Unexpected node type ${node.type}`);
  }
}
