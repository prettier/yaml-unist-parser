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

const MAP_KEY_DUPLICATE_ERROR_MESSAGE_PREFIX = 'Map keys must be unique; "';
const MAP_KEY_DUPLICATE_ERROR_MESSAGE_SUFFIX = '" is repeated';
const ERROR_MESSAGE_SHOULD_ALWAYS_IGNORE = `${MAP_KEY_DUPLICATE_ERROR_MESSAGE_PREFIX}<<${MAP_KEY_DUPLICATE_ERROR_MESSAGE_SUFFIX}`;
function shouldIgnoreError(
  error: unknown,
  allowDuplicateKeysInMap: boolean | undefined,
): boolean | undefined {
  if (!(error instanceof YAMLSemanticError)) {
    return false;
  }

  const { message } = error;
  return (
    message === ERROR_MESSAGE_SHOULD_ALWAYS_IGNORE ||
    (allowDuplicateKeysInMap &&
      message.startsWith(MAP_KEY_DUPLICATE_ERROR_MESSAGE_PREFIX) &&
      error.message.endsWith(MAP_KEY_DUPLICATE_ERROR_MESSAGE_SUFFIX))
  );
}

export function parse(text: string, options: ParseOptions): Root {
  const allowDuplicateKeysInMap = options?.allowDuplicateKeysInMap;
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
      if (shouldIgnoreError(error, allowDuplicateKeysInMap)) {
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
