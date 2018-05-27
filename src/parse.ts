import LinesAndColumns from "lines-and-columns";
import parseAST from "yaml/dist/ast/parse";
import { attachComments } from "./attach";
import { Context, transformNode } from "./transform";
import { transformOffset } from "./transforms/offset";
import { transformRange } from "./transforms/range";
import { Comment, Root } from "./types";
import { assertSyntaxError } from "./utils";

export function parse(text: string): Root {
  const rawDocuments = parseAST(text);
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

  const rootPosition = context.transformRange({ start: 0, end: text.length });

  const root: Root = {
    type: "root",
    position: rootPosition,
    children: rawDocuments
      .map(context.transformNode)
      .map((document, index, documents) => {
        if (index === 0) {
          document.position.start = rootPosition.start;
        }
        if (
          text.slice(
            document.position.end.offset - 4,
            document.position.end.offset,
          ) !== "\n..."
        ) {
          const end =
            index === documents.length - 1
              ? rootPosition.end
              : context.transformOffset(
                  documents[index + 1].position.start.offset - 1,
                );
          document.position.end = end;
          document.children[1].position.end = end;
        }
        return document;
      }),
    comments,
  };

  if (context.comments.length !== 0) {
    attachComments(root, context);
  }

  return root;
}
