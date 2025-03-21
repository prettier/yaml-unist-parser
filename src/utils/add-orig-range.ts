import type * as YAML from "yaml";
import type { ParsedCST } from "yaml/parse-cst";

const FINISH = true;

export function addOrigRange(cst: ParsedCST) {
  if (!cst.setOrigRanges()) {
    const fn = (obj: Record<string, any>) => {
      if (isRange(obj)) {
        obj.origStart = obj.start;
        obj.origEnd = obj.end;
        return FINISH;
      }

      if (isFlowChar(obj)) {
        obj.origOffset = obj.offset;
        return FINISH;
      }
    };
    cst.forEach(document => visit(document, fn));
  }
}

function visit(
  obj: any,
  fn: (obj: Record<string, any>) => void | typeof FINISH,
) {
  if (!obj || typeof obj !== "object") {
    return;
  }

  if (fn(obj) === FINISH) {
    return;
  }

  for (const key of Object.keys(obj)) {
    if (key === "context" || key === "error") {
      continue;
    }

    const value = obj[key];
    if (Array.isArray(value)) {
      value.forEach(x => visit(x, fn));
    } else {
      visit(value, fn);
    }
  }
}

function isRange(obj: Record<string, any>): obj is YAML.CST.Range {
  return typeof obj.start === "number";
}

function isFlowChar(obj: Record<string, any>): obj is YAML.CST.FlowChar {
  return typeof obj.offset === "number";
}
