import LinesAndColumns from "lines-and-columns";
import parseAST from "yaml/dist/ast/parse";
import { Context, transformNode, transformNodes } from "./transform";
import { transformRange } from "./transforms/range";
import { Comment, Root } from "./types";

export function parse(text: string): Root {
  const documents = parseAST(text);
  const locator = new LinesAndColumns(text);
  const comments: Comment[] = [];

  const context: Context = {
    text,
    locator,
    comments,
    transformNode: node => transformNode(node, context),
    transformNodes: nodes => transformNodes(nodes, context),
  };

  return {
    type: "root",
    position: transformRange({ start: 0, end: text.length }, context),
    children: context.transformNodes(documents),
  };
}
