import YAML from "yaml";
import { type CST } from "yaml/parse-cst";
import {
  type Alias as _Alias,
  type Merge as _Merge,
  type Node as _Node,
  type Pair as _Pair,
  type Scalar as _Scalar,
} from "yaml/types";

export const { Document, parseCST } = YAML;
export { ParsedCST } from "yaml/parse-cst";
export { YAMLError, YAMLSyntaxError, YAMLSemanticError } from "yaml/util";

export namespace ast {
  export type Alias = _Alias;
  export type BlockFolded = YAML.AST.BlockFolded;
  export type BlockLiteral = YAML.AST.BlockLiteral;
  export type Document = YAML.Document;
  export type FlowMap = YAML.AST.FlowMap;
  export type FlowSeq = YAML.AST.FlowSeq;
  export type Map = YAML.AST.BlockMap;
  export type Merge = _Merge;
  export type Node = _Node;
  export type Pair = _Pair;
  export type PlainValue = YAML.AST.PlainValue;
  export type QuoteDouble = YAML.AST.QuoteDouble;
  export type QuoteSingle = YAML.AST.QuoteSingle;
  export type Scalar = _Scalar;
  export type Seq = YAML.AST.BlockSeq;
}

export namespace cst {
  export type Alias = CST.Alias;
  export type BlankLine = CST.BlankLine;
  export type BlockFolded = CST.BlockFolded;
  export type BlockLiteral = CST.BlockLiteral;
  export type BlockValue = CST.BlockValue;
  export type Comment = CST.Comment;
  export type Directive = CST.Directive;
  export type Document = CST.Document;
  export type FlowChar = CST.FlowChar;
  export type FlowCollection = CST.FlowCollection;
  export type FlowMap = CST.FlowMap;
  export type FlowSeq = CST.FlowSeq;
  export type Map = CST.Map;
  export type MapItem = CST.MapItem;
  export type MapKey = CST.MapKey;
  export type MapValue = CST.MapValue;
  export type Node = CST.Node;
  export type PlainValue = CST.PlainValue;
  export type QuoteDouble = CST.QuoteDouble;
  export type QuoteSingle = CST.QuoteSingle;
  export type QuoteValue = CST.QuoteValue;
  export type Range = CST.Range;
  export type Seq = CST.Seq;
  export type SeqItem = CST.SeqItem;
}
