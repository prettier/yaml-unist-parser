import { YamlUnistNode } from "../types";

export function defineParents(
  node: YamlUnistNode,
  parent: YamlUnistNode = null,
): void {
  if (node === null) {
    return;
  }

  if ("children" in node) {
    (node.children as Array<(typeof node.children)[number]>).forEach(child =>
      defineParents(child, node),
    );
  }

  if ("anchor" in node) {
    defineParents(node.anchor, node);
  }

  if ("tag" in node) {
    defineParents(node.tag, node);
  }

  // istanbul ignore next
  if ("leadingComments" in node) {
    node.leadingComments.forEach(comment => defineParents(comment, node));
  }

  if ("middleComments" in node) {
    node.middleComments.forEach(comment => defineParents(comment, node));
  }

  if ("trailingComments" in node) {
    node.trailingComments.forEach(comment => defineParents(comment, node));
  }

  if ("endComments" in node) {
    node.endComments.forEach(comment => defineParents(comment, node));
  }

  if ("indicatorComments" in node) {
    node.indicatorComments.forEach(comment => defineParents(comment, node));
  }

  Object.defineProperty(node, "_parent", {
    value: parent,
    enumerable: false,
  });
}
