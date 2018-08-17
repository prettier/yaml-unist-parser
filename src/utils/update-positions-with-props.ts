import { YamlUnistNode } from "../types";
import { clone } from "./clone";
import { createUpdater } from "./create-updater";

export function updatePositionsWithProps(node: YamlUnistNode): void {
  if (node === null) {
    return;
  }

  if ("children" in node) {
    const children = node.children as Array<(typeof node.children)[number]>;
    children.forEach(updatePositionsWithProps);
  }

  const startPointUpdater = createUpdater(
    node.position.start,
    (reduced, value) => value.offset < reduced.offset,
  );

  if ("tag" in node && node.tag) {
    startPointUpdater.update(node.tag.position.start);
  }

  if ("anchor" in node && node.anchor) {
    startPointUpdater.update(node.anchor.position.start);
  }

  if (startPointUpdater.hasUpdated()) {
    node.position.start = clone(startPointUpdater.get());
  }
}
