import type * as YAML from "yaml";
import * as YAML_CST from "../cst.ts";
import { createDocumentHead } from "../factories/document-head.ts";
import type { Comment, Directive, Range } from "../types.ts";
import type Context from "./context.ts";
import { transformDirective } from "./directive.ts";

export function transformDocumentHead(
  tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[],
  cstNode: YAML.CST.Document,
  document: YAML.Document.Parsed,
  context: Context,
) {
  const { directives, endCommentCandidates } = categorizeNodes(
    tokensBeforeBody,
    context,
  );

  let betweenTokens: YAML_CST.SourceToken[] = [];
  let docStart: YAML_CST.DocStartSourceToken | null = null;
  for (const token of YAML_CST.tokens(cstNode.start)) {
    betweenTokens.push(token);
    if (!docStart && token.type === "doc-start") {
      // Collect comments between directives and doc-start
      for (const t of betweenTokens) {
        if (t.type === "comment") {
          const comment = context.transformComment(t);
          endCommentCandidates.push(comment);
        }
      }

      // Reset betweenTokens to collect tokens after doc-start
      betweenTokens = [];

      docStart = token;
    }
  }

  const position = getPosition(directives, document, docStart, context);

  let trailingComment: null | Comment = null;
  if (docStart && betweenTokens.length > 0) {
    const lastToken = betweenTokens[0];
    if (lastToken.type === "comment") {
      const loc = context.transformOffset(lastToken.offset);
      if (loc.line === position.end.line) {
        trailingComment = context.transformComment(lastToken);
        // Remove from betweenTokens as it's trailing comment of document head
        betweenTokens.shift();
      }
    }
  }

  const endComments = docStart ? endCommentCandidates : [];

  const documentHead = createDocumentHead(
    position,
    directives,
    endComments,
    trailingComment,
  );

  return {
    documentHead,
    docStart,
    tokensBeforeBody: betweenTokens,
  };
}
function categorizeNodes(
  tokensBeforeBody: (YAML_CST.CommentSourceToken | YAML.CST.Directive)[],
  context: Context,
) {
  const directives: Directive[] = [];
  let endCommentCandidates: Comment[] = [];

  let lastDirective: Directive | null = null;
  for (const token of tokensBeforeBody) {
    if (token.type === "comment") {
      const node = context.transformComment(token);
      if (
        lastDirective &&
        lastDirective.position.end.line === node.position.start.line &&
        !lastDirective.trailingComment
      ) {
        lastDirective.trailingComment = node;
        lastDirective.position.end = node.position.end;
      } else {
        endCommentCandidates.push(node);
      }
    } else {
      const node = transformDirective(token, context);
      directives.push(node);
      lastDirective = node;
      endCommentCandidates = [];
    }
  }
  return { directives, endCommentCandidates };
}

function getPosition(
  directives: Directive[],
  document: YAML.Document.Parsed,
  docStart: YAML.CST.SourceToken | null,
  context: Context,
) {
  const range: Range = docStart
    ? [docStart.offset, docStart.offset + docStart.source.length]
    : document.contents
      ? [document.contents.range[0], document.contents.range[0]]
      : [document.range[0], document.range[0]];

  if (directives.length !== 0) {
    range[0] = directives[0].position.start.offset;
  }

  return context.transformRange(range);
}
