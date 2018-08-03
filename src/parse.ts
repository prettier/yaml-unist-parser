import LinesAndColumns from "lines-and-columns";
import YAML from "yaml";
import { attachComments } from "./attach";
import { createRoot } from "./factories/root";
import { Context, transformNode } from "./transform";
import { transformOffset } from "./transforms/offset";
import { transformRange } from "./transforms/range";
import { Comment, Root } from "./types";
import {
  createError,
  isYAMLError,
  overwriteEnd,
  overwriteStart,
} from "./utils";

export function parse(text: string): Root {
  const rawDocuments = YAML.parseCST(text);
  const locator = new LinesAndColumns(text);
  const comments: Comment[] = [];

  const context: Context = {
    text,
    locator,
    comments,
    transformNode: node => transformNode(node, context),
    transformRange: range => transformRange(range, context),
    transformOffset: offset => transformOffset(offset, context),
  };

  rawDocuments.forEach(rawDocument => {
    const rawErrors = new YAML.Document({ merge: true })
      .parse(rawDocument)
      .errors.filter(isYAMLError);

    if (rawErrors.length !== 0) {
      throw createError(rawErrors[0], context);
    }
  });

  const rootPosition = context.transformRange({ start: 0, end: text.length });

  const children = rawDocuments
    .map(context.transformNode)
    .map((document, index, documents) => {
      if (index === 0) {
        overwriteStart(document, rootPosition.start);
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
        overwriteEnd(document, end);
        overwriteEnd(document.children[1], end);
      }
      return document;
    });

  const root = createRoot(rootPosition, children, comments);

  if (context.comments.length !== 0) {
    attachComments(root, context);
  }

  return root;
}
