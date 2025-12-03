import * as YAML from "yaml";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import Context from "./transforms/context.js";
import { transformError } from "./transforms/error.js";
import type { ParseOptions, Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

export function parse(
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: ParseOptions,
): Root {
  // const allowDuplicateKeysInMap = options?.allowDuplicateKeysInMap;
  const parser = new YAML.Parser();
  const composer = new YAML.Composer({
    keepSourceTokens: true,
    uniqueKeys: true,
  });
  const documentNodes: YAML.Document.Parsed[] = [];
  const cstTokens: YAML.CST.Token[] = [];
  const context = new Context(text);

  for (const cst of parser.parse(text)) {
    cstTokens.push(cst);
    for (const doc of composer.next(cst)) {
      documentNodes.push(doc);
    }
  }

  for (const doc of composer.end()) {
    documentNodes.push(doc);
  }

  for (const doc of documentNodes) {
    for (const error of doc.errors) {
      throw transformError(error, context);
    }
  }

  const root = createRoot(
    context.transformRange({ origStart: 0, origEnd: text.length }),
    context.transformDocuments(documentNodes, cstTokens),
    context.getOrderedComments(),
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
