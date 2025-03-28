import type * as YAML from "yaml";

type YamlCstNode =
  | YAML.CST.Alias
  | YAML.CST.BlankLine
  | YAML.CST.BlockFolded
  | YAML.CST.BlockLiteral
  | YAML.CST.BlockValue
  | YAML.CST.Comment
  | YAML.CST.Directive
  | YAML.CST.Document
  | YAML.CST.FlowCollection
  | YAML.CST.FlowMap
  | YAML.CST.FlowSeq
  | YAML.CST.Map
  | YAML.CST.MapItem
  | YAML.CST.MapKey
  | YAML.CST.MapValue
  | YAML.CST.PlainValue
  | YAML.CST.QuoteDouble
  | YAML.CST.QuoteSingle
  | YAML.CST.QuoteValue
  | YAML.CST.Seq
  | YAML.CST.SeqItem;

export function removeCstBlankLine(node: YamlCstNode) {
  switch (node.type) {
    case "DOCUMENT":
      for (let i = node.contents.length - 1; i >= 0; i--) {
        if (node.contents[i].type === "BLANK_LINE") {
          node.contents.splice(i, 1);
        } else {
          removeCstBlankLine(node.contents[i]);
        }
      }
      for (let i = node.directives.length - 1; i >= 0; i--) {
        if (node.directives[i].type === "BLANK_LINE") {
          node.directives.splice(i, 1);
        }
      }
      break;
    case "FLOW_MAP":
    case "FLOW_SEQ":
    case "MAP":
    case "SEQ":
      for (let i = node.items.length - 1; i >= 0; i--) {
        const item = node.items[i];
        if ("char" in item) {
          continue;
        }
        if (item.type === "BLANK_LINE") {
          node.items.splice(i, 1);
        } else {
          removeCstBlankLine(item);
        }
      }
      break;
    case "MAP_KEY":
    case "MAP_VALUE":
    case "SEQ_ITEM":
      if (node.node) {
        removeCstBlankLine(node.node);
      }
      break;
    case "ALIAS":
    case "BLANK_LINE":
    case "BLOCK_FOLDED":
    case "BLOCK_LITERAL":
    case "COMMENT":
    case "DIRECTIVE":
    case "PLAIN":
    case "QUOTE_DOUBLE":
    case "QUOTE_SINGLE":
      break;
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${JSON.stringify(node!.type)}`);
  }
}
