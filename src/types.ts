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
  anchor?: string;
  tag?: { verbatim: string } | { handle: string; suffix: string };
}

export interface CommentAttachable {
  /** comments in front of the node */
  leadingComments: Comment[];
  /** comments between the node and its tag/anchor */
  middleComments: Comment[];
  /** comments on the same line of the node */
  trailingComments: Comment[];
}

export interface YAMLSyntaxError extends SyntaxError {
  source: string;
  position: Position;
}

export type YamlUnistNode =
  | Comment
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
  | FlowSequence
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

export interface Root extends Parent {
  type: "root";
  children: Document[];
  comments: Comment[];
}

export interface Document extends Parent {
  type: "document";
  children: [DocumentHead, DocumentBody];
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

export interface Alias extends Node, CommentAttachable {
  type: "alias";
  value: string;
}

export interface BlockValue extends Node, Content, CommentAttachable {
  chomping: "clip" | "keep" | "strip";
  indent?: number;
  value: string;
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

export interface MappingItem extends Parent, CommentAttachable {
  type: "mappingItem";
  /** key-value pair */
  children: [MappingKey, MappingValue];
}

export interface MappingKey extends Parent, CommentAttachable {
  type: "mappingKey";
  children: [ContentNode];
}

export interface MappingValue extends Parent, CommentAttachable {
  type: "mappingValue";
  children: [ContentNode];
}

export interface Sequence extends Parent, Content, CommentAttachable {
  type: "sequence";
  children: SequenceItem[];
}

export interface SequenceItem extends Parent, CommentAttachable {
  type: "sequenceItem";
  children: [ContentNode];
}

export interface FlowCollection extends Parent, Content, CommentAttachable {
  children: Array<MappingItem | SequenceItem>;
}

export interface FlowMapping extends FlowCollection {
  type: "flowMapping";
  children: MappingItem[];
}

export interface FlowSequence extends FlowCollection {
  type: "flowSequence";
  children: Array<MappingItem | SequenceItem>;
}
