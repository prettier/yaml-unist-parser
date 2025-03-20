import YAML, { isAlias, isDocument, isMap, isScalar, isSeq } from "yaml";

import { transformAlias } from "./transforms/alias.js";
import { transformBlockFolded } from "./transforms/block-folded.js";
import { transformBlockLiteral } from "./transforms/block-literal.js";
import { transformComment } from "./transforms/comment.js";
import { transformDirective } from "./transforms/directive.js";
import { transformDocument } from "./transforms/document.js";
import { transformFlowMap } from "./transforms/flow-map.js";
import { transformFlowSeq } from "./transforms/flow-seq.js";
import { transformMap } from "./transforms/map.js";
import { transformPlain } from "./transforms/plain.js";
import { transformQuoteDouble } from "./transforms/quote-double.js";
import { transformQuoteSingle } from "./transforms/quote-single.js";
import { type Range } from "./transforms/range.js";
import { transformSeq } from "./transforms/seq.js";
import {
  type Alias,
  type BlockFolded,
  type BlockLiteral,
  type Comment,
  type Content,
  type Directive,
  type Document,
  type FlowMapping,
  type FlowSequence,
  type Mapping,
  type Plain,
  type Point,
  type Position,
  type QuoteDouble,
  type QuoteSingle,
  type Sequence,
  type YAMLBlockFolded,
  type YAMLBlockLiteral,
  type YAMLComment,
  type YAMLPlain,
  type YAMLQuoteDouble,
  type YAMLQuoteSingle,
  type YamlUnistNode,
} from "./types.js";

export type YamlNode<T = unknown, V = unknown> =
  | null
  | YAML.Alias
  | YAML.Document<YAML.Node<T>>
  | YAML.Pair<T, V>
  | YAML.YAMLMap<T, V>
  | YAML.YAMLSeq<T>
  | YAML.YAMLOMap // YAMLOMap.tag === 'tag:yaml.org,2002:omap'
  | YAML.YAMLSet<T> // YAMLSet.tag === 'tag:yaml.org,2002:set'
  | YAML.CST.BlockMap
  | YAML.CST.BlockSequence
  | YAML.CST.Directive

  // YAML.Scalar
  | YAMLBlockFolded
  | YAMLBlockLiteral
  | YAMLPlain
  | YAMLQuoteDouble
  | YAMLQuoteSingle
  | YAMLComment;

// prettier-ignore
export type YamlToUnist<T extends YamlNode> =
  T extends null ? null :
  T extends YAML.Alias ? Alias :
  T extends YAML.Document ? Document :
  T extends YAML.YAMLMap ? Mapping :
  T extends YAML.YAMLSeq ? Sequence :

  // YAML.Scalar
  T extends YAMLBlockFolded ? BlockFolded :
  T extends YAMLBlockLiteral ? BlockLiteral :
  T extends YAMLPlain ? Plain :
  T extends YAMLQuoteDouble ? QuoteDouble :
  T extends YAMLQuoteSingle ? QuoteSingle :

  T extends YAMLComment ? Comment :

  T extends YAML.CST.Directive ? Directive :
  T extends YAML.CST.BlockMap ? FlowMapping :
  T extends YAML.CST.BlockSequence ? FlowSequence :
  never;

export interface Context {
  text: string;
  locator: LinesAndColumns;
  comments: Comment[];
  transformOffset: (offset: number) => Point;
  transformRange: (range: Range) => Position;
  transformNode: <T extends YamlNode>(node: T) => YamlToUnist<T>;
  transformContent: (node: YAML.Node) => Content;
}

export function transformNode<T extends YamlNode>(
  node: T,
  context: Context,
): YamlToUnist<T>;
export function transformNode(
  node: YamlNode,
  context: Context,
): YamlUnistNode | null {
  if (node == null) {
    return null;
  }

  if (isAlias(node)) {
    return transformAlias(node, context);
  }

  if (isDocument(node)) {
    return transformDocument(node, context);
  }

  if (isMap(node)) {
    return transformMap(node, context);
  }

  if (isSeq<YAML.Node>(node)) {
    return transformSeq(node, context);
  }

  if (isScalar<string>(node)) {
    switch (node.type) {
      case YAML.Scalar.BLOCK_FOLDED: {
        return transformBlockFolded(node, context);
      }
      case YAML.Scalar.BLOCK_LITERAL: {
        return transformBlockLiteral(node, context);
      }
      case YAML.Scalar.PLAIN: {
        return transformPlain(node, context);
      }
      case YAML.Scalar.QUOTE_DOUBLE: {
        return transformQuoteDouble(node, context);
      }
      case YAML.Scalar.QUOTE_SINGLE: {
        return transformQuoteSingle(node, context);
      }
    }
  }

  if ("type" in node) {
    switch (node.type) {
      case "block-map": {
        return transformFlowMap(node, context);
      }
      case "block-seq": {
        return transformFlowSeq(node, context);
      }
      case "comment": {
        return transformComment(node, context);
      }
      case "directive": {
        return transformDirective(node, context);
      }
    }
  }

  // istanbul ignore next
  throw new Error(
    `Unexpected node type ${"type" in node ? node.type : "unknown"}`,
  );
}
