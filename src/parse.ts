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
  });
  const yamlDocuments: YAML.Document.Parsed[] = [];
  const yamlTokens = [...parser.parse(text)];

  for (const document of composer.compose(yamlTokens, true, text.length)) {
    const { errors } = document;
    if (errors.length > 0) {
      throw new YAMLSyntaxError(context, errors[0]);
    }

    yamlDocuments.push(document);
  }

  const root = createRoot(
    context.transformRange([0, text.length]),
    transformDocuments(yamlDocuments, yamlTokens, context),
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
