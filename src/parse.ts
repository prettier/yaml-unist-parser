import * as YAML from "yaml";
import { attachComments } from "./attach.ts";
import { createRoot } from "./factories/root.ts";
import Context from "./transforms/context.ts";
import { transformError } from "./transforms/error.ts";
import type { ParseOptions, Root } from "./types.ts";
import { removeFakeNodes } from "./utils/remove-fake-nodes.ts";
import { updatePositions } from "./utils/update-positions.ts";

export function parse(text: string, options?: ParseOptions): Root {
  const lineCounter = new YAML.LineCounter();
  const parser = new YAML.Parser(lineCounter.addNewLine);
  const composer = new YAML.Composer({
    keepSourceTokens: true,
    // Intentionally to not cast to boolean, so user can pass a function (undocumented)
    // https://eemeli.org/yaml/#options
    uniqueKeys: options?.uniqueKeys,
    lineCounter,
  });
  const documentNodes: YAML.Document.Parsed[] = [];
  const cstTokens: YAML.CST.Token[] = [];
  const context = new Context(text, lineCounter);

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
