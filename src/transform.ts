import LinesAndColumns from "lines-and-columns";
import { tranformAlias } from "./transforms/alias";
import { tranformBlockFolded } from "./transforms/blockFolded";
import { tranformBlockLiteral } from "./transforms/blockLiteral";
import { transformComment } from "./transforms/comment";
import { transformDirective } from "./transforms/directive";
import { transformDocument } from "./transforms/document";
import { transformFlowMap } from "./transforms/flowMap";
import { transformFlowSeq } from "./transforms/flowSeq";
import { transformMap } from "./transforms/map";
import { transformNull } from "./transforms/null";
import { transformOffset } from "./transforms/offset";
import { transformPlain } from "./transforms/plain";
import { transformQuoteDouble } from "./transforms/quoteDouble";
import { transformQuoteSingle } from "./transforms/quoteSingle";
import { transformRange } from "./transforms/range";
import { transformSeq } from "./transforms/seq";
import {
  Alias,
  BlockFolded,
  BlockLiteral,
  Comment,
  CommentAttachable,
  Content,
  Directive,
  Document,
  FlowMapping,
  FlowSequence,
  Mapping,
  Null,
  Plain,
  QuoteDouble,
  QuoteSingle,
  Sequence,
  YamlUnistNode,
} from "./types";

export type YamlNode =
  | null
  | yaml.Alias
  | yaml.BlockValue
  | yaml.Comment
  | yaml.Directive
  | yaml.Document
  | yaml.FlowCollection
  | yaml.Map
  | yaml.PlainValue
  | yaml.QuoteValue
  | yaml.Seq;

// prettier-ignore
export type YamlToUnist<T extends YamlNode> =
  T extends null ? Null :
  T extends yaml.Alias ? Alias :
  T extends yaml.BlockValue ? BlockLiteral | BlockFolded :
  T extends yaml.Comment ? Comment :
  T extends yaml.Directive ? Directive :
  T extends yaml.Document ? Document :
  T extends yaml.FlowCollection ? FlowMapping | FlowSequence :
  T extends yaml.Map ? Mapping :
  T extends yaml.PlainValue ? Plain :
  T extends yaml.QuoteValue ? QuoteDouble | QuoteSingle :
  T extends yaml.Seq ? Sequence :
  never;

export interface Context {
  text: string;
  comments: Comment[];
  locator: LinesAndColumns;
  transformNode: <T extends YamlNode>(node: T) => YamlToUnist<T>;
  transformNodes: <T extends YamlNode>(
    nodes: T[],
  ) => Array<Exclude<YamlToUnist<T>, Comment>>;
}

export function transformNode<T extends YamlNode>(
  node: T,
  context: Context,
): YamlToUnist<T>;
export function transformNode(node: YamlNode, context: Context): YamlUnistNode {
  if (node === null) {
    return transformNull();
  }

  // TODO: error
  // TODO: attach leadingComments and trailingComments

  const transformedNode = _transformNode(node, context);

  if (transformedNode.type === "comment") {
    return transformedNode;
  }

  let startOffset = transformedNode.position.start.offset;
  const commentRanges: yaml.Range[] = [];

  node.props.forEach(prop => {
    const char = context.text[prop.start];
    switch (char) {
      case "!": // tag
      case "&": // anchor
        if (prop.start < startOffset) {
          startOffset = prop.start;
        }
        break;
      case "#": // comment
        commentRanges.push(prop);
        break;
      // istanbul ignore next
      default:
        throw new Error(`Unexpected leading character ${JSON.stringify(char)}`);
    }
  });

  if (startOffset !== transformedNode.position.start.offset) {
    transformedNode.position.start = transformOffset(startOffset, context);
  }

  commentRanges.forEach(commentRange => {
    const { start, end } = commentRange;

    const comment: Comment = {
      type: "comment",
      position: transformRange(commentRange, context),
      value: context.text.slice(commentRange.start + 1, commentRange.end),
    };

    if (
      transformedNode.position.start.offset <= start &&
      transformedNode.position.end.offset >= end
    ) {
      (transformedNode as CommentAttachable).middleComments.push(comment);
    } else {
      context.comments.push(comment);
    }
  });

  const tag = node.tag;
  if (tag) {
    (transformedNode as Content).tag = tag;
  }

  const anchor = node.anchor;
  if (anchor) {
    (transformedNode as Content).anchor = anchor;
  }

  return transformedNode;
}

function _transformNode(
  node: Exclude<YamlNode, null>,
  context: Context,
): YamlUnistNode {
  // prettier-ignore
  switch (node.type) {
    case "ALIAS": return tranformAlias(node, context);
    case "BLOCK_FOLDED": return tranformBlockFolded(node, context);
    case "BLOCK_LITERAL": return tranformBlockLiteral(node, context);
    case "COMMENT": return transformComment(node, context);
    case "DIRECTIVE": return transformDirective(node, context);
    case "DOCUMENT": return transformDocument(node, context);
    case "FLOW_MAP": return transformFlowMap(node, context);
    case "FLOW_SEQ": return transformFlowSeq(node, context);
    case "MAP": return transformMap(node, context);
    case "PLAIN": return transformPlain(node, context);
    case "QUOTE_DOUBLE": return transformQuoteDouble(node, context);
    case "QUOTE_SINGLE": return transformQuoteSingle(node, context);
    case "SEQ": return transformSeq(node, context);
    // istanbul ignore next
    default: throw new Error(`Unexpected node type ${(node as yaml.Node).type}`);
  }
}

/**
 * transform `YamlNode`s to `YamlUnistNode`s and extract `Comment`s to `context.comments`.
 */
export function transformNodes<T extends YamlNode>(
  nodes: T[],
  context: Context,
): Array<Exclude<YamlToUnist<T>, Comment>> {
  return nodes.reduce(
    (reduced, node) =>
      node && node.type === "COMMENT"
        ? (context.comments.push(
            transformComment(node as yaml.Comment, context),
          ),
          reduced)
        : reduced.concat(
            // @ts-ignore: not assignable due to unknown reason
            transformNode(node as Exclude<T, yaml.Comment>, context),
          ),
    [] as Array<Exclude<YamlToUnist<T>, Comment>>,
  );
}
