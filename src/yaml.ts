// tslint:disable:no-namespace
// tslint:disable:no-shadowed-variable
// tslint:disable:variable-name

import { AST, Document as _Document } from "yaml";
import { CST } from "yaml/parse-cst";
import { Pair as _Pair } from "yaml/types";

export const Document = _Document;
export { parseCST } from "yaml";
export { ParsedCST } from "yaml/parse-cst";
export { YAMLError, YAMLSyntaxError, YAMLSemanticError } from "yaml/util";

export namespace ast {
  export type Alias = AST.Alias;
  export type BlockFolded = AST.BlockFolded;
  export type BlockLiteral = AST.BlockLiteral;
  export type Document = _Document;
  export type FlowMap = AST.FlowMap;
  export type FlowSeq = AST.FlowSeq;
  export type Map = AST.BlockMap;
  export type Merge = AST.Merge;
  export type Node = AST.Node;
  export type Pair = _Pair;
  export type PlainValue = AST.PlainValue;
  export type QuoteDouble = AST.QuoteDouble;
  export type QuoteSingle = AST.QuoteSingle;
  export type Scalar = AST.ScalarNode;
  export type Seq = AST.BlockSeq;
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
