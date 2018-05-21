import { testSyntaxError } from "./helpers";

testSyntaxError("a: - 123", "throw if node.error is not null");
