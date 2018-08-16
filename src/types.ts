export interface Point {
  /** 1-based */
  line: number;
  /** 1-based */
  column: number;
  /** 0-based */
  offset: number;
}

export interface Position {
  start: Point;
  end: Point;
}

export interface Node {
  type: string;
  position: Position;
  /** @internal non-enumerable */
  _parent?: Exclude<YamlUnistNode, null>;
}

export interface Parent extends Node {
  children: Array<Node | null>;
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
  /** comments on the same line of the node */
  trailingComments: Comment[];
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
  | FlowSequenceItem
  | null;

export type ContentNode =
  | Alias
  | BlockLiteral
  | BlockFolded
  | Plain
  | QuoteSingle
  | QuoteDouble
  | Mapping
  | Sequence
  | FlowMapping
  | FlowSequence
  | null;

// -----------------------------------------------------------------------------

export interface Comment extends Node {
  type: "comment";
  value: string;
}

export interface Anchor extends Node {
  type: "anchor";
  value: string;
}

export interface Tag extends Node {
  type: "tag";
  value: string;
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

export interface DocumentHead extends Parent, EndCommentAttachable {
  type: "documentHead";
  children: Directive[];
}

export interface DocumentBody extends Parent, EndCommentAttachable {
  type: "documentBody";
  children: [ContentNode];
}

export interface Directive extends Node, CommentAttachable {
  type: "directive";
  name: string;
  parameters: string[];
}

export interface Alias extends Node, Content, CommentAttachable {
  type: "alias";
  value: string;
}

export interface BlockValue extends Node, Content, LeadingCommentAttachable {
  chomping: "clip" | "keep" | "strip";
  indent: null | number;
  value: string;
  /** comments between indicator and the value */
  indicatorComments: Comment[];
}

export interface BlockLiteral extends BlockValue {
  type: "blockLiteral";
}

export interface BlockFolded extends BlockValue {
  type: "blockFolded";
}

export interface Plain extends Node, Content, CommentAttachable {
  type: "plain";
  value: string;
}

export interface QuoteValue extends Node, Content, CommentAttachable {
  value: string;
}

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
  children: [ContentNode];
}

export interface MappingValue
  extends Parent,
    CommentAttachable,
    EndCommentAttachable {
  type: "mappingValue";
  children: [ContentNode];
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
  children: [ContentNode];
}

export interface SequenceItem
  extends SequenceItemBase,
    CommentAttachable,
    EndCommentAttachable {
  type: "sequenceItem";
}

export interface FlowCollection extends Parent, Content, CommentAttachable {
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
