"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTestEvaluator = void 0;
const utils_1 = require("../code-challenge/utils");
const runTestEvaluator = ({ code, internalTest, removeComments, expectPasses = true, }) => __awaiter(void 0, void 0, void 0, function* () {
    let userPassed = true;
    let evaluationError;
    // console.log("original code", code);
    const formattedCode = (0, utils_1.getCode)(code, removeComments);
    const logs = [];
    // Checking Params
    // console.log("***formattedCode", formattedCode);
    // console.log("***evaluationError", evaluationError);
    // console.log("---expectPasses: ", expectPasses);
    // logs.push("test this");
    // console.log("***logs", logs);
    // console.log("***code***", code);
    // console.log("***internalTest***", internalTest);
    // console.log("***removeComments***", removeComments);
    (0, utils_1.overrideConsoleLog)((args) => {
        logs.push(args);
        // @ts-expect-error will fix later
        console.standardLog("args", ...args);
    });
    let result;
    try {
        // @ts-expect-error will fix later
        const context = (0, utils_1.getEvaluationContext)(formattedCode, logs);
        // Error: Max Call Stack Exceeded! Why...? Override Console?
        // console.log("CONTEXT: ", JSON.stringify(context));
        result = (0, utils_1.evaluateWithContext)(`${formattedCode};
      ${internalTest};`, context);
        // if Error, catch is run...
        console.log("\n\n", "<test-evaluator.ts TRY BLOCK RESULT>".toUpperCase(), result, "\n\n ------------------------");
        // if (result === expectPasses) {
        //   console.log(
        //     "\n\n**result === expectPasses**\n\n",
        //     result === expectPasses
        //   );
        //   result = true;
        // }
        // this code will never run due to catch block
        // *Needs to be in a finally block.
        //
    }
    catch (err) {
        // if (expectPasses === false) {
        //   console.log("CATCH FUNCTIONING");
        //   userPassed = false;
        //   // evaluationError = undefined;
        // } else if (expectPasses === true) {
        //   userPassed = false;
        //   evaluationError = err;
        // }
        userPassed = false;
        evaluationError = err;
    }
    finally {
        // console.log("---expectPasses: ", expectPasses);
        console.log("\n\n<FINALLY RESULT>", result);
        console.log("<FINAL TYPE>", typeof result, "\n\n");
        console.log("<formattedCode>", formattedCode);
        console.log("<internalTest>", internalTest);
        if (typeof result !== "boolean") {
            // throw new Error(
            //   "result type MUST be a boolean (src/api/code-challenge/content-types/code-challenge/test-evaluator.ts)"
            // );
            console.log("\n\n<FINAL TYPE>", typeof result);
            console.log(`"<RESULT TYPE INCORRECT> MUST be a boolean (src/api/code-challenge/content-types/code-challenge/test-evaluator.ts)"\n\n`);
        }
        else if (result === false) {
            // throw new Error("did not pass");
            console.log(`original: 'did not pass'`);
        }
    }
    (0, utils_1.restoreConsoleLog)();
    return {
        error: evaluationError,
        test: internalTest,
        pass: userPassed,
    };
});
exports.runTestEvaluator = runTestEvaluator;
if (typeof self !== "undefined") {
    self.postMessage({ type: "contentLoaded" });
}
