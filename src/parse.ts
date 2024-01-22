import { LinesAndColumns } from "lines-and-columns";
import YAML from "yaml";

import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import { removeCstBlankLine } from "./preprocess.js";
import { Context, transformNode } from "./transform.js";
import { transformContent } from "./transforms/content.js";
import { transformOffset } from "./transforms/offset.js";
import { transformRange } from "./transforms/range.js";
import { Comment, Document, Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

export function parse(text: string): Root {
  const documents = YAML.parseAllDocuments(text, {
    strict: false,
    uniqueKeys: false,
  });

  const locator = new LinesAndColumns(text);
  const comments: Comment[] = [];

  const context: Context = {
    text,
    locator,
    comments,
    transformOffset: offset => transformOffset(offset, context),
    transformRange: range => transformRange(range, context),
    transformNode: node => transformNode(node, context),
    transformContent: node => transformContent(node, context),
  };

  for (const document of documents) {
    for (const error of document.errors) {
      if (
        error instanceof YAML.YAMLParseError &&
        error.code === "DUPLICATE_KEY"
      ) {
        continue;
        8;
      }
      throw error;
    }
  }

  documents.forEach(removeCstBlankLine);

  const root = createRoot(
    context.transformRange({ origStart: 0, origEnd: context.text.length }),
    documents.map(context.transformNode).filter(Boolean) as Document[],
    comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
