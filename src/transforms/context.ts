import type * as YAML from "yaml";
import type * as YAMLTypes from "yaml/types";
import { createPosition } from "../factories/position.js";
import type {
  Comment,
  Content,
  ParsedCST,
  Point,
  Position,
  Range,
} from "../types.js";
import { transformContent } from "./content.js";
import { transformNode, type YamlNode, type YamlToUnist } from "./transform.js";

type RangeAsLinePosGetter = (this: {
  range: { start: number; end: number };
  context: any;
}) => {
  start: { line: number; col: number };
  end: { line: number; col: number };
};

type CSTContext = {
  root: { context: { src: string } };
};

let rangeAsLinePosGetter: RangeAsLinePosGetter;

class Context {
  text;
  comments: Comment[] = [];
  #cst;
  #cstContext: CSTContext | undefined;

  constructor(cst: ParsedCST, text: string) {
    this.text = text;
    this.#cst = cst;
  }

  setOrigRanges() {
    if (this.#cst.setOrigRanges()) {
      return;
    }

    // From `yaml/parse-cst`
    // https://github.com/eemeli/yaml/blob/4cdcde632ece71155f3108ec0120c1a0329a6914/src/cst/parse.js#L22
    for (const document of this.#cst) {
      document.setOrigRanges([], 0);
    }
  }

  #getRangePosition(range: Range): { start: Point; end: Point } {
    if (!rangeAsLinePosGetter) {
      const [document] = this.#cst;
      const Node = Object.getPrototypeOf(
        Object.getPrototypeOf(document),
      ) as YAML.CST.Node;
      rangeAsLinePosGetter = Object.getOwnPropertyDescriptor(
        Node,
        "rangeAsLinePos",
      )!.get as RangeAsLinePosGetter;
    }

    this.#cstContext ??= { root: { context: { src: this.text } } };

    const {
      start: { line: startLine, col: startColumn },
      end: { line: endLine, col: endColumn },
    } = rangeAsLinePosGetter.call({
      range: {
        start: this.#ensureOffsetInRange(range.origStart),
        end: this.#ensureOffsetInRange(range.origEnd),
      },
      context: this.#cstContext,
    });

    return {
      start: { offset: range.origStart, line: startLine, column: startColumn },
      end: { offset: range.origEnd, line: endLine, column: endColumn },
    };
  }

  #ensureOffsetInRange(offset: number) {
    if (offset < 0) {
      return 0;
    }

    if (offset > this.text.length) {
      return this.text.length;
    }

    return offset;
  }

  transformOffset(offset: number): Point {
    return this.#getRangePosition({
      origStart: offset,
      origEnd: offset,
    }).start;
  }

  transformRange(range: Range): Position {
    const { start, end } = this.#getRangePosition(range);
    return createPosition(start, end);
  }

  transformNode<T extends YamlNode>(node: T): YamlToUnist<T> {
    return transformNode(node, this);
  }

  transformContent(node: YAMLTypes.Node): Content {
    return transformContent(node, this);
  }
}

export default Context;
