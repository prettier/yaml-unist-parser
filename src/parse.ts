import * as YAML from "yaml";
import { attachComments } from "./attach.ts";
import { createRoot } from "./factories/root.ts";
import Context from "./transforms/context.ts";
import { transformError } from "./transforms/error.ts";
import type { ParseOptions, Root } from "./types.ts";
import { removeFakeNodes } from "./utils/remove-fake-nodes.ts";
import { updatePositions } from "./utils/update-positions.ts";

export function parse(text: string, options?: ParseOptions): Root {
  const parser = new YAML.Parser();
  const composer = new YAML.Composer({
    keepSourceTokens: true,
    // Intentionally to not cast to boolean, so user can pass a function (undocumented)
    // https://eemeli.org/yaml/#options
    uniqueKeys: options?.uniqueKeys,
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
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
