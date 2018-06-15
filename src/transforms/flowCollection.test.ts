import { testSyntaxError } from "../helpers";

testSyntaxError("{");
testSyntaxError("{]");
testSyntaxError("{ : : }");
testSyntaxError("{ : ? }");
testSyntaxError("{ ? ? }");
