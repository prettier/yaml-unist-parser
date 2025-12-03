import type * as YAML from "yaml";
import type * as YAML_CST from "../cst.ts";
import { createPosition } from "../factories/position.ts";
import type {
  Comment,
  Content,
  Document,
  Point,
  Position,
  Range,
} from "../types.ts";
import { transformComment } from "./comment.ts";
import { transformContentProperties } from "./content.ts";
import { transformDocuments } from "./document.ts";
import {
  transformNode,
  type TransformNodeProperties,
  type YamlNode,
  type YamlToUnist,
} from "./transform.ts";

class Context {
  text;
  comments: Comment[] = [];
  #linesAndColumns: LinesAndColumns;

  constructor(text: string) {
    this.text = text;
    this.#linesAndColumns = new LinesAndColumns(text);
  }

  #getRangePosition(range: Range): { start: Point; end: Point } {
    if (this.text === "" && range.origStart === 0 && range.origEnd === 0) {
      return {
        start: { offset: 0, line: 1, column: 1 },
        end: { offset: 0, line: 1, column: 1 },
      };
    }

    return {
      start: this.#linesAndColumns.getPoint(range.origStart),
      end: this.#linesAndColumns.getPoint(range.origEnd),
    };
  }

  transformOffset(offset: number): Point {
    return this.#linesAndColumns.getPoint(offset);
  }

  transformRange(range: Range): Position {
    const { start, end } = this.#getRangePosition(range);
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

class LinesAndColumns {
  private lineBreakIndices: number[];

  constructor(text: string) {
    this.lineBreakIndices = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "\n") {
        this.lineBreakIndices.push(i);
      } else if (ch === "\r") {
        if (i + 1 < text.length && text[i + 1] === "\n") {
          this.lineBreakIndices.push(i + 1);
          i++;
        } else {
          this.lineBreakIndices.push(i);
        }
      }
    }
  }

  /**
   * Get line and column for the given offset.
   * @param offset 0-based offset
   * @returns 1-based line and 1-based column
   */
  getPoint(offset: number): Point {
    let low = 0;
    let high = this.lineBreakIndices.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const lineBreakIndex = this.lineBreakIndices[mid];

      if (lineBreakIndex < offset) {
        low = mid + 1;
      } else if (lineBreakIndex > offset) {
        high = mid - 1;
      } else {
        return {
          line: mid + 1,
          column:
            mid === 0 ? offset + 1 : offset - this.lineBreakIndices[mid - 1],
          offset,
        };
      }
    }

    const line = low + 1;
    const lineStartIndex = low === 0 ? 0 : this.lineBreakIndices[low - 1] + 1;
    const column = offset - lineStartIndex + 1;

    return { line, column, offset };
  }
}
