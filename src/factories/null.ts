import { Null } from "../types";
import { createNode } from "./node";
import { createPoint } from "./point";
import { createPosition } from "./position";

export function createNull(): Null {
  return createNode(
    "null",
    createPosition(createPoint(-1, -1, -1), createPoint(-1, -1, -1)),
  );
}
