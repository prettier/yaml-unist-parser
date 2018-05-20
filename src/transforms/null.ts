import { Null } from "../types";

export function transformNull(): Null {
  return {
    type: "null",
    position: {
      start: { line: -1, column: -1, offset: -1 },
      end: { line: -1, column: -1, offset: -1 },
    },
  };
}
