import { Point, YamlUnistNode } from "../types";
import { getReducedValue } from "./get-reduced-value";

export function getStartPoint(node: NonNullable<YamlUnistNode>) {
  const points: Point[] = [node.position.start];

  if ("tag" in node && node.tag) {
    points.push(node.tag.position.start);
  }

  if ("anchor" in node && node.anchor) {
    points.push(node.anchor.position.start);
  }

  return getReducedValue(
    points,
    point => point.offset,
    (reduced, current) => current < reduced,
  )!;
}
