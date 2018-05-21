import LinesAndColumns from "lines-and-columns";
import parseAST from "yaml/dist/ast/parse";
import { attachComments } from "./attach";
import { Context, transformNode } from "./transform";
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
  };

  const root: Root = {
    type: "root",
    position: transformRange({ start: 0, end: text.length }, context),
    children: documents.map(context.transformNode),
    comments,
  };

  if (context.comments.length !== 0) {
    attachComments(root, context);
  }

  return root;
}
