import assert = require("assert");
import { Context } from "../transform";
import { Document, DocumentHead, Position } from "../types";
import { cloneObject, defineCommentParent, getLast } from "../utils";
import { transformRange } from "./range";

export function transformDocument(
  document: yaml.Document,
  context: Context,
): Document {
  assert(document.valueRange !== null);

  const directives = document.directives.map(context.transformNode);
  const lastContinuousCommentCount = directives.reduce(
    (reduced, node) => (node.type === "comment" ? reduced + 1 : 0),
    0,
  );
  const directivesWithoutNonTrailingComments = directives.filter(
    (node, index) => {
      if (
        index < directives.length - lastContinuousCommentCount &&
        node.type === "comment"
      ) {
        context.comments.push(node);
        return false;
      }
      return true;
    },
  );

  const contents = document.contents.map(context.transformNode);
  const contentsWithoutComments = contents.filter(node => {
    if (node.type === "comment") {
      context.comments.push(node);
      return false;
    }
    return true;
  });

  const headPosition: Position = (text => {
    const match = text.match(/(^|\n)---\s*$/);
    const marker = "---";
    const markerIndex = match ? context.text.indexOf(marker, match.index) : -1;
    const start =
      directives.length !== 0
        ? directives[0].position.start.offset
        : !match
          ? document.valueRange!.start
          : markerIndex;
    const end = match
      ? markerIndex + marker.length
      : document.valueRange!.start;
    return transformRange({ start, end }, context);
  })(context.text.slice(0, document.valueRange!.start));

  const bodyPosition: Position = (text => {
    const match = text.match(/^\s*\.\.\.(\s*\n|$)/);
    const marker = "...";
    const markerIndex = match
      ? context.text.indexOf(marker, document.valueRange!.end + match.index!)
      : -1;
    const start =
      contents.length !== 0
        ? contents[0].position.start.offset
        : document.valueRange!.start;
    const end = match
      ? markerIndex + marker.length
      : contents.length !== 0
        ? getLast(contents)!.position.end.offset
        : document.valueRange!.start;
    return transformRange({ start, end }, context);
  })(context.text.slice(document.valueRange!.end));

  const position = cloneObject({
    start: headPosition.start,
    end: bodyPosition.end,
  });

  const documentHead: DocumentHead = {
    type: "documentHead",
    children: [],
    position: headPosition,
  };

  documentHead.children = directivesWithoutNonTrailingComments.map(
    directive => {
      if (directive.type === "comment") {
        context.comments.push(directive);
        defineCommentParent(directive, documentHead);
      }
      return directive;
    },
  );

  return {
    type: "document",
    position,
    children: [
      documentHead,
      {
        type: "documentBody",
        children: contentsWithoutComments, // handle standalone comment in attach
        position: bodyPosition,
      },
    ],
  };
}
