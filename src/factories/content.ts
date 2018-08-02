import { Content } from "../types";
import { createNull } from "./null";

export function createContent(): Content {
  return {
    anchor: createNull(),
    tag: createNull(),
    middleComments: [],
  };
}
