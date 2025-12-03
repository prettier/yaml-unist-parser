import { testSyntaxError } from "../helpers.ts";

testSyntaxError("{");
testSyntaxError("{]");
testSyntaxError("{ : : }");
testSyntaxError("{ : ? }");
testSyntaxError("{ ? ? }");
