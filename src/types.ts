import type * as YAML from "yaml";

export type ParsedCST = ReturnType<typeof YAML.parseCST>;

export interface Node {
  type: string;
  position: Position;
  /** @internal non-enumerable */
  _parent?: YamlUnistNode | null;
}

export interface Position {
  start: Point;
  end: Point;
}

export interface Range {
  origStart: number;
  origEnd: number;
}

export interface Point {
  /** 1-based */
  line: number;
  /** 1-based */
  column: number;
  /** 0-based */
  offset: number;
}

export interface Parent extends Node {
  children: Node[];
}

export interface Literal extends Node {
  value: string;
}

// -----------------------------------------------------------------------------

export interface Content {
  anchor: null | Anchor;
  tag: null | Tag;
  /** comments between the node and its tag/anchor */
  middleComments: Comment[];
}

export interface CommentAttachable
  extends LeadingCommentAttachable,
    TrailingCommentAttachable {}

export interface LeadingCommentAttachable {
  /** comments in front of the node */
  leadingComments: Comment[];
}

export interface TrailingCommentAttachable {
  /** comment on the same line of the node */
  trailingComment: null | Comment;
}

export interface EndCommentAttachable {
  /** comments after the node with greater column */
  endComments: Comment[];
}

export interface YAMLSyntaxError extends SyntaxError {
  source: string;
  position: Position;
}

export type YamlUnistNode =
  | Comment
  | Tag
  | Anchor
  | Root
  | Document
  | DocumentHead
  | DocumentBody
  | Directive
  | Alias
  | BlockLiteral
  | BlockFolded
  | Plain
  | QuoteSingle
  | QuoteDouble
  | Mapping
  | MappingItem
  | MappingKey
  | MappingValue
  | Sequence
  | SequenceItem
  | FlowMapping
  | FlowMappingItem
  | FlowSequence
  | FlowSequenceItem;

export type ContentNode = Extract<YamlUnistNode, Content>;

// -----------------------------------------------------------------------------

export interface Comment extends Literal {
  type: "comment";
}

export interface Anchor extends Literal {
  type: "anchor";
}

export interface Tag extends Literal {
  type: "tag";
}

export interface Root extends Parent {
  type: "root";
  children: Document[];
  comments: Comment[];
}

export interface Document extends Parent, TrailingCommentAttachable {
  type: "document";
  children: [DocumentHead, DocumentBody];
}

export interface DocumentHead
  extends Parent,
    EndCommentAttachable,
    TrailingCommentAttachable {
  type: "documentHead";
  children: Directive[];
}

export interface DocumentBody extends Parent, EndCommentAttachable {
  type: "documentBody";
  children: [] | [ContentNode];
}

export interface Directive extends Node, CommentAttachable {
  type: "directive";
  name: string;
  parameters: string[];
}

export interface Alias extends Literal, Content, CommentAttachable {
  type: "alias";
}

export interface BlockValue extends Literal, Content, LeadingCommentAttachable {
  chomping: "clip" | "keep" | "strip";
  indent: null | number;
  /** comment between indicator and the value */
  indicatorComment: null | Comment;
}

export interface BlockLiteral extends BlockValue {
  type: "blockLiteral";
}

export interface BlockFolded extends BlockValue {
  type: "blockFolded";
}

export interface Plain extends Literal, Content, CommentAttachable {
  type: "plain";
}

export interface QuoteValue extends Literal, Content, CommentAttachable {}

export interface QuoteSingle extends QuoteValue {
  type: "quoteSingle";
}

export interface QuoteDouble extends QuoteValue {
  type: "quoteDouble";
}

export interface Mapping extends Parent, Content, LeadingCommentAttachable {
  type: "mapping";
  children: MappingItem[];
}

export interface MappingItemBase extends Parent, LeadingCommentAttachable {
  /** key-value pair */
  children: [MappingKey, MappingValue];
}

export interface MappingItem extends MappingItemBase {
  type: "mappingItem";
}

export interface MappingKey
  extends Parent,
    TrailingCommentAttachable,
    EndCommentAttachable {
  type: "mappingKey";
  children: [] | [ContentNode];
}

export interface MappingValue
  extends Parent,
    CommentAttachable,
    EndCommentAttachable {
  type: "mappingValue";
  children: [] | [ContentNode];
}

export interface Sequence
  extends Parent,
    Content,
    LeadingCommentAttachable,
    EndCommentAttachable {
  type: "sequence";
  children: SequenceItem[];
}

export interface SequenceItemBase extends Parent {
  children: [] | [ContentNode];
}

export interface SequenceItem
  extends SequenceItemBase,
    CommentAttachable,
    EndCommentAttachable {
  type: "sequenceItem";
}

export interface FlowCollection
  extends Parent,
    Content,
    CommentAttachable,
    EndCommentAttachable {
  children: Array<FlowMappingItem | FlowSequenceItem>;
}

export interface FlowMapping extends FlowCollection {
  type: "flowMapping";
  children: FlowMappingItem[];
}

export interface FlowMappingItem extends MappingItemBase {
  type: "flowMappingItem";
}

export interface FlowSequence extends FlowCollection {
  type: "flowSequence";
  children: Array<FlowMappingItem | FlowSequenceItem>;
}

export interface FlowSequenceItem extends SequenceItemBase {
  type: "flowSequenceItem";
}
