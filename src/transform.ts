import assert = require("assert");
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
import { transformMapKey } from "./transforms/mapKey";
import { transformMapValue } from "./transforms/mapValue";
import { transformNull } from "./transforms/null";
import { transformPlain } from "./transforms/plain";
import { transformQuoteDouble } from "./transforms/quoteDouble";
import { transformQuoteSingle } from "./transforms/quoteSingle";
import { transformRange } from "./transforms/range";
import { transformSeq } from "./transforms/seq";
import { transformSeqItem } from "./transforms/seqItem";
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
  MappingKey,
  MappingValue,
  Null,
  Plain,
  Point,
  Position,
  QuoteDouble,
  QuoteSingle,
  Sequence,
  SequenceItem,
  YamlUnistNode,
} from "./types";
import { defineParent } from "./utils";

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
  | yaml.Seq
  | yaml.MapItem
  | yaml.SeqItem;

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
  T extends yaml.MapItem ? MappingKey | MappingValue :
  T extends yaml.SeqItem ? SequenceItem :
  never;

export interface Context {
  text: string;
  comments: Comment[];
  locator: LinesAndColumns;
  transformNode: <T extends YamlNode>(node: T) => YamlToUnist<T>;
  transformRange: (range: { start: number; end: number }) => Position;
  transformOffset: (offset: number) => Point;
}

export function transformNode<T extends YamlNode>(
  node: T,
  context: Context,
): YamlToUnist<T>;
export function transformNode(node: YamlNode, context: Context): YamlUnistNode {
  if (node === null) {
    return transformNull();
  }

  const transformedNode = _transformNode(node, context);

  if (transformedNode.type === "comment") {
    return transformedNode;
  }

  let newStartOffset = -1;
  const commentRanges: yaml.Range[] = [];

  let tagRange: yaml.Range | null = null;
  let anchorRange: yaml.Range | null = null;

  node.props.forEach(prop => {
    const char = context.text[prop.start];
    switch (char) {
      case "!": // tag
      case "&": // anchor
        if (
          prop.start <
          (newStartOffset !== -1
            ? newStartOffset
            : transformedNode.position.start.offset)
        ) {
          newStartOffset = prop.start;
        }
        if (char === "!") {
          tagRange = prop;
        } else {
          anchorRange = prop;
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

  commentRanges.forEach(commentRange => {
    const { start, end } = commentRange;

    const comment: Comment = {
      type: "comment",
      position: transformRange(commentRange, context),
      value: context.text.slice(commentRange.start + 1, commentRange.end),
    };

    if (
      "middleComments" in transformedNode &&
      newStartOffset !== -1 &&
      newStartOffset <= start &&
      transformedNode.position.start.offset >= end
    ) {
      defineParent(comment, transformedNode);
      transformedNode.middleComments.push(comment);
    } else if (
      (transformedNode.type === "blockFolded" ||
        transformedNode.type === "blockLiteral") &&
      (transformedNode.position.start.offset < start &&
        transformedNode.position.end.offset > end)
    ) {
      defineParent(comment, transformedNode);
      transformedNode.trailingComments.push(comment);
    }
    context.comments.push(comment);
  });

  if (tagRange) {
    assert("tag" in transformedNode);
    const tag = node.tag!;
    (transformedNode as Content).tag =
      "verbatim" in tag
        ? {
            type: "verbatimTag",
            value: tag.verbatim,
            position: context.transformRange(tagRange),
          }
        : tag.handle === "!" && tag.suffix === ""
          ? {
              type: "nonSpecificTag",
              position: context.transformRange(tagRange),
            }
          : {
              type: "shorthandTag",
              handle: tag.handle,
              suffix: tag.suffix,
              position: context.transformRange(tagRange),
            };
  }

  if (anchorRange) {
    assert("anchor" in transformedNode);
    const anchor = node.anchor!;
    (transformedNode as Content).anchor = {
      type: "anchor",
      value: anchor,
      position: context.transformRange(anchorRange),
    };
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
    case "MAP_KEY": return transformMapKey(node, context);
    case "MAP_VALUE": return transformMapValue(node, context);
    case "PLAIN": return transformPlain(node, context);
    case "QUOTE_DOUBLE": return transformQuoteDouble(node, context);
    case "QUOTE_SINGLE": return transformQuoteSingle(node, context);
    case "SEQ": return transformSeq(node, context);
    case "SEQ_ITEM": return transformSeqItem(node, context);
    // istanbul ignore next
    default: throw new Error(`Unexpected node type ${(node as yaml.Node).type}`);
  }
}
