import { Anchor, Comment, Content, Tag } from "../types.js";

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
