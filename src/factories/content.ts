import { type Anchor, type Comment, type Content, type Tag } from "../types.js";

export function createContent(
  tag: Tag | null,
  anchor: Anchor | null,
  middleComments: Comment[],
): Content {
  return {
    anchor,
    tag,
    middleComments,
  };
}
