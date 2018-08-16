import { Parent, Point, YamlUnistNode } from "../types";
import { clone } from "./clone";
import { getLast } from "./get-last";
import { getReducedValue } from "./get-reduced-value";
import { getStartPoint } from "./get-start-point";

export function updatePositions(node: YamlUnistNode): void {
  if (node === null || !("children" in node)) {
    return;
  }

  (node.children as Array<(typeof node.children)[number]>).forEach(
    updatePositions,
  );

  const { startPoints, endPoints } = collectPoints(node);

  if (startPoints.length !== 0) {
    const minPoint = getReducedValue(
      startPoints,
      point => point.offset,
      (reduced, current) => current < reduced,
    )!;
    if (minPoint.offset < node.position.start.offset) {
      node.position.start = clone(minPoint);
    }
  }

  if (endPoints.length !== 0) {
    const maxPoint = getReducedValue(
      endPoints,
      point => point.offset,
      (reduced, current) => current > reduced,
    )!;
    if (maxPoint.offset > node.position.end.offset) {
      node.position.end = clone(maxPoint);
    }
  }
}

function collectPoints(node: Extract<YamlUnistNode, Parent>) {
  const startPoints: Point[] = [];
  const endPoints: Point[] = [];

  if ("endComments" in node && node.endComments.length !== 0) {
    endPoints.push(getLast(node.endComments)!.position.end);
  }

  const nonNullChildren = (node.children as Array<
    (typeof node.children)[number]
  >).filter(Boolean);
  if (nonNullChildren.length !== 0) {
    const firstChild = nonNullChildren[0]!;
    const lastChild = getLast(nonNullChildren)!;

    startPoints.push(getStartPoint(firstChild));
    endPoints.push(lastChild.position.end);

    if (
      "leadingComments" in firstChild &&
      firstChild.leadingComments.length !== 0
    ) {
      startPoints.push(firstChild.leadingComments[0].position.start);
    }

    if (
      "trailingComments" in lastChild &&
      lastChild.trailingComments.length !== 0
    ) {
      endPoints.push(getLast(lastChild.trailingComments)!.position.end);
    }
  }

  return {
    startPoints,
    endPoints,
  };
}
