import { testSyntaxError } from "../helpers.js";

testSyntaxError("{");
testSyntaxError("{]");
testSyntaxError("{ : : }");
testSyntaxError("{ : ? }");
testSyntaxError("{ ? ? }");
