import { Document, parseCST } from "yaml";
import { YAMLSemanticError } from "yaml/util";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import { removeCstBlankLine } from "./preprocess.js";
import Context from "./transforms/context.js";
import { transformError } from "./transforms/error.js";
import { type Root } from "./types.js";
import { addOrigRange } from "./utils/add-orig-range.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

export function parse(text: string): Root {
  const cst = parseCST(text);

  addOrigRange(cst);

  const documents = cst.map(cstDocument =>
    new Document({
      merge: false,
      keepCstNodes: true,
      prettyErrors: false,
    }).parse(cstDocument),
  );

  const context = new Context(cst, text);

  for (const document of documents) {
    for (const error of document.errors) {
      if (
        error instanceof YAMLSemanticError &&
        error.message === 'Map keys must be unique; "<<" is repeated'
      ) {
        continue;
      }
      throw transformError(error, context);
    }
  }

  documents.forEach(document => removeCstBlankLine(document.cstNode!));

  const root = createRoot(
    context.transformRange({ origStart: 0, origEnd: context.text.length }),
    documents.map(document => context.transformNode(document)),
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
