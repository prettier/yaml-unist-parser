import * as YAML from "yaml";
import { attachComments } from "./attach.ts";
import { createRoot } from "./factories/root.ts";
import Context from "./transforms/context.ts";
import { transformDocuments } from "./transforms/document.ts";
import type { ParseOptions, Root } from "./types.ts";
import { removeFakeNodes } from "./utils/remove-fake-nodes.ts";
import { updatePositions } from "./utils/update-positions.ts";
import { YAMLSyntaxError } from "./yaml-syntax-error.ts";

export function parse(text: string, options?: ParseOptions): Root {
  const lineCounter = new YAML.LineCounter();
  const context = new Context(text, lineCounter);
  const parser = new YAML.Parser(lineCounter.addNewLine);
  const composer = new YAML.Composer({
    keepSourceTokens: true,
    // Intentionally to not cast to boolean, so user can pass a function (undocumented)
    // https://eemeli.org/yaml/#options
    uniqueKeys: options?.uniqueKeys,
    lineCounter,
    merge: true,
  });
  const parsedDocuments: YAML.Document.Parsed[] = [];
  const cstTokens = [...parser.parse(text)];

  for (const parsedDocument of composer.compose(cstTokens, true, text.length)) {
    const { errors } = parsedDocument;
    if (errors.length > 0) {
      throw new YAMLSyntaxError(context, errors[0]);
    }

    parsedDocuments.push(parsedDocument);
  }

  const root = createRoot(
    context.transformRange([0, text.length]),
    transformDocuments(parsedDocuments, cstTokens, context),
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
