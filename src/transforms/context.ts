import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.js";
import { createPosition } from "../factories/position.js";
import type {
  Comment,
  Content,
  Document,
  Point,
  Position,
  Range,
} from "../types.js";
import { transformComment } from "./comment.js";
import { transformContentProperties } from "./content.js";
import { transformDocuments } from "./document.js";
import {
  transformNode,
  type TransformNodeProperties,
  type YamlNode,
  type YamlToUnist,
} from "./transform.js";

class Context {
  text;
  comments: Comment[] = [];
  #lineCounter: YAML.LineCounter;

  constructor(text: string, lineCounter: YAML.LineCounter) {
    this.text = text;
    this.#lineCounter = lineCounter;
  }

  transformOffset(offset: number): Point {
    const { line, col } = this.#lineCounter.linePos(offset);
    return { line, column: col, offset };
  }

  transformRange(range: Range): Position {
    const [start, end] = range.map(position => this.transformOffset(position));
    return createPosition(start, end);
  }

  transformDocuments(
    documentNodes: YAML.Document.Parsed[],
    cstTokens: YAML.CST.Token[],
  ): Document[] {
    return transformDocuments(documentNodes, cstTokens, this);
  }

  transformNode<T extends YamlNode>(
    node: T,
    props: TransformNodeProperties,
  ): YamlToUnist<T> {
    return transformNode(node, this, props);
  }

  transformComment(node: YAML_CST.CommentSourceToken): Comment {
    const comment = transformComment(node, this);
    this.comments.push(comment);
    return comment;
  }

  transformContentProperties(
    node:
      | YAML.ParsedNode
      | YAML.YAMLSeq.Parsed<
          YAML.ParsedNode | YAML.Pair<YAML.ParsedNode, YAML.ParsedNode | null>
        >,
    tokens: YAML_CST.ContentPropertyToken[],
  ): Content {
    return transformContentProperties(node, tokens, this);
  }
}

export default Context;
