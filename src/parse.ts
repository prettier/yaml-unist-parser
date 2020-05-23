import LinesAndColumns from "lines-and-columns";
import { attachComments } from "./attach";
import { createRoot } from "./factories/root";
import { removeCstBlankLine } from "./preprocess";
import { Context, transformNode } from "./transform";
import { transformContent } from "./transforms/content";
import { transformError } from "./transforms/error";
import { transformOffset } from "./transforms/offset";
import { transformRange } from "./transforms/range";
import { Comment, Root } from "./types";
import { addOrigRange } from "./utils/add-orig-range";
import { removeFakeNodes } from "./utils/remove-fake-nodes";
import { updatePositions } from "./utils/update-positions";
import * as YAML from "./yaml";

export function parse(text: string): Root {
  const cst = YAML.parseCST(text);

  addOrigRange(cst);

  const documents = cst.map(cstDocument =>
    new YAML.Document({
      merge: true,
      keepCstNodes: true,
    }).parse(cstDocument),
  );

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

  const errorDocument = documents.find(
    document => document.errors.length !== 0,
  );

  if (errorDocument) {
    throw transformError(errorDocument.errors[0], context);
  }

  documents.forEach(document => removeCstBlankLine(document.cstNode!));

  const root = createRoot(
    context.transformRange({ origStart: 0, origEnd: context.text.length }),
    documents.map(context.transformNode),
    comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
