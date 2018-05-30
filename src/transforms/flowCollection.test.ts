import { testSyntaxError } from "../helpers";

// testSyntaxError("{"); // TODO
testSyntaxError("{]");
testSyntaxError("{ : : }");
testSyntaxError("{ : ? }");
testSyntaxError("{ ? ? }");
