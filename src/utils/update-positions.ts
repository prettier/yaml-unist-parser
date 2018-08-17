import { YamlUnistNode } from "../types";
import { clone } from "./clone";
import { createUpdater } from "./create-updater";
import { getLast } from "./get-last";

export function updatePositions(node: YamlUnistNode): void {
  if (node === null || !("children" in node)) {
    return;
  }

  const children = node.children as Array<(typeof node.children)[number]>;
  children.forEach(updatePositions);

  const startPointUpdater = createUpdater(
    node.position.start,
    (reduced, value) => value.offset < reduced.offset,
  );

  const endPointUpdater = createUpdater(
    node.position.end,
    (reduced, value) => value.offset > reduced.offset,
  );

  if ("endComments" in node && node.endComments.length !== 0) {
    endPointUpdater.update(getLast(node.endComments)!.position.end);
  }

  const nonNullChildren = children.filter(
    (child): child is Exclude<typeof child, null> => child !== null,
  );

  if (nonNullChildren.length !== 0) {
    const firstChild = nonNullChildren[0];
    const lastChild = getLast(nonNullChildren)!;

    startPointUpdater.update(firstChild.position.start);
    endPointUpdater.update(lastChild.position.end);

    if (
      "leadingComments" in firstChild &&
      firstChild.leadingComments.length !== 0
    ) {
      startPointUpdater.update(firstChild.leadingComments[0].position.start);
    }

    if ("tag" in firstChild && firstChild.tag) {
      startPointUpdater.update(firstChild.tag.position.start);
    }

    if ("anchor" in firstChild && firstChild.anchor) {
      startPointUpdater.update(firstChild.anchor.position.start);
    }

    if ("trailingComment" in lastChild && lastChild.trailingComment) {
      endPointUpdater.update(lastChild.trailingComment.position.end);
    }
  }

  if (startPointUpdater.hasUpdated()) {
    node.position.start = clone(startPointUpdater.get());
  }

  if (endPointUpdater.hasUpdated()) {
    node.position.end = clone(endPointUpdater.get());
  }
}
