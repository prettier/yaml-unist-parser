import YAML from "yaml";

import { createRoot } from "./factories/root.js";
import { removeCstBlankLine } from "./preprocess.js";
import { type Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";
import { attachComments } from "./attach.js";
import Context from "./transforms/context.js";

export function parse(text: string): Root {
  const documents = YAML.parseAllDocuments(text, {
    strict: false,
    uniqueKeys: false,
  });

  const context = new Context(cst, text);

  for (const document of documents) {
    for (const error of document.errors) {
      if (
        error instanceof YAML.YAMLParseError &&
        error.code === "DUPLICATE_KEY"
      ) {
        continue;
      }
      throw error;
    }
  }

  documents.forEach(removeCstBlankLine);

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
