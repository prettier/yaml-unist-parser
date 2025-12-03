import * as YAML from "yaml";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import Context from "./transforms/context.js";
import { transformError } from "./transforms/error.js";
import type { ParseOptions, Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

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
      documentNodes.push(throwParseError(doc, context));
    }
  }

  for (const doc of composer.end()) {
    documentNodes.push(throwParseError(doc, context));
  }

  const root = createRoot(
    context.transformRange([0, text.length]),
    context.transformDocuments(documentNodes, cstTokens),
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}

function throwParseError(document: YAML.Document.Parsed, context: Context) {
  const { errors } = document;
  if (errors.length > 0) {
    throw transformError(errors[0], context);
  }
  return document;
}
