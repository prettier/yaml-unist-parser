import LinesAndColumns from "lines-and-columns";
import parseAST from "yaml/dist/ast/parse";
import { attachComments } from "./attach";
import { Context, transformNode } from "./transform";
import { transformOffset } from "./transforms/offset";
import { transformRange } from "./transforms/range";
import { Comment, Root } from "./types";
import { assertSyntaxError } from "./utils";

export function parse(text: string): Root {
  const documents = parseAST(text);
  const locator = new LinesAndColumns(text);
  const comments: Comment[] = [];

  const context: Context = {
    text,
    locator,
    comments,
    transformNode: node => transformNode(node, context),
    transformRange: range => transformRange(range, context),
    transformOffset: offset => transformOffset(offset, context),
    assertSyntaxError: (value, message, position) =>
      assertSyntaxError(value, message, position, context),
  };

  const root: Root = {
    type: "root",
    position: context.transformRange({ start: 0, end: text.length }),
    children: documents.map(context.transformNode),
    comments,
  };

  if (context.comments.length !== 0) {
    attachComments(root, context);
  }

  return root;
}
