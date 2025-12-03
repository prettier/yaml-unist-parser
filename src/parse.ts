import * as YAML from "yaml";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import Context from "./transforms/context.js";
import { transformError } from "./transforms/error.js";
import type { ParseOptions, Root } from "./types.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";

export function parse(text: string, options?: ParseOptions): Root {
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

  const allowDuplicateKeysInMap = options?.allowDuplicateKeysInMap;
  for (const doc of documentNodes) {
    for (const error of doc.errors) {
      if (shouldIgnoreError(text, error, allowDuplicateKeysInMap)) {
        continue;
      }
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

const ERROR_CODE_DUPLICATE_KEY = "DUPLICATE_KEY";
function shouldIgnoreError(
  text: string,
  error: unknown,
  allowDuplicateKeysInMap: boolean | undefined,
): boolean | undefined {
  if (
    !(
      error instanceof YAML.YAMLParseError &&
      error.code === ERROR_CODE_DUPLICATE_KEY
    )
  ) {
    return false;
  }

  if (allowDuplicateKeysInMap) {
    return true;
  }

  const index = error.pos[0];
  const character = text.charAt(index);
  const key =
    character === "<"
      ? text.slice(index, index + 2)
      : text.slice(index + 1, index + 3);
  return key === "<<";
}
