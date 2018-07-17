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
}

export interface Parent extends Node {
  children: Node[];
}

// -----------------------------------------------------------------------------

export interface Content {
  anchor: Null | Anchor;
  tag: Null | VerbatimTag | ShorthandTag | NonSpecificTag;
  /** comments between the node and its tag/anchor */
  middleComments: Comment[];
}

export interface CommentAttachable {
  /** comments in front of the node */
  leadingComments: Comment[];
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
  | VerbatimTag
  | ShorthandTag
  | NonSpecificTag
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
  | Null;

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
  | Null;

// -----------------------------------------------------------------------------

export interface Null extends Node {
  type: "null";
  /** always -1 */
  position: Position;
}

export interface Comment extends Node {
  type: "comment";
  value: string;
  /** @internal non-enumerable */
  parent?: Extract<YamlUnistNode, CommentAttachable>;
}

export interface Anchor extends Node {
  type: "anchor";
  value: string;
}

export interface VerbatimTag extends Node {
  type: "verbatimTag";
  value: string;
}

export interface ShorthandTag extends Node {
  type: "shorthandTag";
  handle: string;
  suffix: string;
}

export interface NonSpecificTag extends Node {
  type: "nonSpecificTag";
}

export interface Root extends Parent {
  type: "root";
  children: Document[];
  comments: Comment[];
}

export interface Document extends Parent, CommentAttachable {
  type: "document";
  children: [DocumentHead, DocumentBody];
  /** always 0 */
  leadingComments: Comment[];
  /** only attachable on `...` */
  trailingComments: Comment[];
}

export interface DocumentHead extends Parent {
  type: "documentHead";
  children: Array<Comment | Directive>;
}

export interface DocumentBody extends Parent {
  type: "documentBody";
  children: Array<Comment | ContentNode>;
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

export interface BlockValue extends Node, Content, CommentAttachable {
  chomping: "clip" | "keep" | "strip";
  indent: null | number;
  value: string;
  /** comments between indicator and value */
  trailingComments: Comment[];
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

export interface Mapping extends Parent, Content, CommentAttachable {
  type: "mapping";
  children: MappingItem[];
}

export interface MappingItemBase extends Parent, CommentAttachable {
  /** key-value pair */
  children: [MappingKey | Null, MappingValue | Null];
}

export interface MappingItem extends MappingItemBase {
  type: "mappingItem";
  children: [MappingKey, MappingValue | Null];
}

export interface MappingKey
  extends Parent,
    CommentAttachable,
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
    CommentAttachable,
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
