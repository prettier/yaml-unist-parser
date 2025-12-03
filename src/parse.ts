import YAML from "yaml";
import { YAMLSemanticError } from "yaml/util";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import { removeCstBlankLine } from "./preprocess.js";
import Context from "./transforms/context.js";
import { transformError } from "./transforms/error.js";
import { type ParseOptions, type Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

export function parse(text: string, options: ParseOptions = {}): Root {
  const { allowDuplicateKeys = false } = options;
  const cst = YAML.parseCST(text);
  const context = new Context(cst, text);
  context.setOrigRanges();

  const documents = cst.map(cstDocument =>
    new YAML.Document({
      merge: false,
      keepCstNodes: true,
    }).parse(cstDocument),
  );

  for (const document of documents) {
    for (const error of document.errors) {
      // TODO: Use `code` not `message` to check after upgrade to yaml@2
      if (
        error instanceof YAMLSemanticError &&
        (error.message === 'Map keys must be unique; "<<" is repeated' ||
          (allowDuplicateKeys &&
            error.message.startsWith("Map keys must be unique") &&
            error.message.endsWith('" is repeated')))
      ) {
        continue;
      }
      throw transformError(error, context);
    }
  }

  documents.forEach(document => removeCstBlankLine(document.cstNode!));

  const root = createRoot(
    context.transformRange({ origStart: 0, origEnd: text.length }),
    documents.map(document => context.transformNode(document)),
    context.comments,
  );

  attachComments(root);
  updatePositions(root);
  removeFakeNodes(root);

  return root;
}
