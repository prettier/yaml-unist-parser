declare module "yaml" {
  export default _;
  namespace _ {
    export class Document {
      errors: yaml.YAMLError[];
      parse(document: yaml.Document): this;
    }
  }
}

declare module "yaml/dist/ast/parse" {
  export default function parse(src: string): yaml.Document[];
}

declare namespace yaml {
  type YAMLError = YAMLSyntaxError | YAMLSemanticError | YAMLReferenceError;

  interface YAMLSyntaxError extends SyntaxError {
    name: "YAMLSyntaxError";
    source: yaml.Node;
  }
  interface YAMLSemanticError extends SyntaxError {
    name: "YAMLSemanticError";
    source: yaml.Node;
  }
  interface YAMLReferenceError extends ReferenceError {
    name: "YAMLReferenceError";
    source: yaml.Node;
  }

  interface Range {
    start: number;
    end: number;
    readonly length: number;
    readonly isEmpty: boolean;
  }

  interface ParseContext {
    /** Node starts at beginning of line */
    atLineStart: boolean;
    /** true if currently in a collection context */
    inCollection: boolean;
    /** true if currently in a flow context */
    inFlow: boolean;
    /** Current level of indentation */
    indent: number;
    /** Start of the current line */
    lineStart: number;
    /** The parent of the node */
    parent: Node;
    /** Source of the YAML document */
    src: string;
  }

  interface Node {
    context: ParseContext | null;
    /** if not null, indicates a parser failure */
    error: YAMLSyntaxError | null;
    /** span of context.src parsed into this node */
    range: Range | null;
    valueRange: Range | null;
    /** anchors, tags and comments */
    props: Range[];
    /** specific node type */
    type: string;
    /** if non-null, overrides source value */
    value: string | null;

    readonly anchor: string | null;
    readonly comment: string | null;
    readonly hasComment: boolean;
    readonly hasProps: boolean;
    readonly jsonLike: boolean;
    readonly rawValue: string | null;
    readonly tag:
      | null
      | { verbatim: string }
      | { handle: string; suffix: string };
    readonly valueRangeContainsNewline: boolean;
  }

  interface Alias extends Node {
    type: "ALIAS";
    /** contain the anchor without the * prefix */
    readonly rawValue: string;
  }

  type Scalar = BlockValue | PlainValue | QuoteValue;

  interface BlockValue extends Node {
    type: "BLOCK_FOLDED" | "BLOCK_LITERAL";
    chomping: "CLIP" | "KEEP" | "STRIP";
    blockIndent: number | null;
    header: Range;
    readonly strValue: string | null;
  }

  interface PlainValue extends Node {
    type: "PLAIN";
    readonly strValue: string | null;
  }

  interface QuoteValue extends Node {
    type: "QUOTE_DOUBLE" | "QUOTE_SINGLE";
    readonly strValue:
      | null
      | string
      | { str: string; errors: YAMLSyntaxError[] };
  }

  interface Comment extends Node {
    type: "COMMENT";
    readonly anchor: null;
    readonly comment: string;
    readonly rawValue: null;
    readonly tag: null;
  }

  interface MapItem extends Node {
    type: "MAP_KEY" | "MAP_VALUE";
    node: ContentNode | null;
  }

  interface Map extends Node {
    type: "MAP";
    /** implicit keys are not wrapped */
    items: Array<Comment | Alias | Scalar | MapItem>;
  }

  interface SeqItem extends Node {
    type: "SEQ_ITEM";
    node: ContentNode | null;
  }

  interface Seq extends Node {
    type: "SEQ";
    items: Array<Comment | SeqItem>;
  }

  type FlowChar = "{" | "}" | "[" | "]" | "," | "?" | ":";

  interface FlowCollection extends Node {
    type: "FLOW_MAP" | "FLOW_SEQ";
    items: Array<FlowChar | Comment | Alias | Scalar | FlowCollection>;
  }

  type ContentNode = Comment | Alias | Scalar | Map | Seq | FlowCollection;

  interface Directive extends Node {
    type: "DIRECTIVE";
    name: string;
    readonly anchor: null;
    readonly parameters: string[];
    readonly tag: null;
  }

  interface Document extends Node {
    type: "DOCUMENT";
    directives: Array<Comment | Directive>;
    contents: ContentNode[];
    readonly anchor: null;
    readonly comment: null;
    readonly tag: null;
  }
}
