import assert = require("assert");
import { Context } from "../transform";
import { Document, Position } from "../types";
import { cloneObject, getLast } from "../utils";
import { transformRange } from "./range";

export function transformDocument(
  document: yaml.Document,
  context: Context,
): Document {
  assert(document.valueRange !== null);

  const directives = context.transformNodes(document.directives);
  const contents = context.transformNodes(document.contents);

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

  return {
    type: "document",
    position,
    children: [
      {
        type: "documentHead",
        children: directives,
        position: headPosition,
      },
      {
        type: "documentBody",
        children: contents,
        position: bodyPosition,
      },
    ],
  };
}
