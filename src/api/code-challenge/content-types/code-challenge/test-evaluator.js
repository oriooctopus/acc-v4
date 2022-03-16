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
const runTestEvaluator = ({ code, internalTest, removeComments, }) => __awaiter(void 0, void 0, void 0, function* () {
    let userPassed = true;
    let evaluationError;
    // console.log("original code", code);
    const formattedCode = (0, utils_1.getCode)(code, removeComments);
    const logs = [];
    // This is logging to console just fine
    // console.log("***formattedCode", formattedCode);
    // console.log("***evaluationError", evaluationError);
    // logs.push("test this");
    // console.log("***logs", logs);
    // console.log("***code***", code);
    // console.log("***internalTest***", internalTest);
    // console.log("***removeComments***", removeComments);
    (0, utils_1.overrideConsoleLog)((args) => {
        // Doesn't work!
        // console.log("---overrideConsoleLog running-----");
        logs.push(args);
        // @ts-expect-error will fix later
        console.standardLog("args", ...args);
    });
    try {
        // @ts-expect-error will fix later
        const context = (0, utils_1.getEvaluationContext)(formattedCode, logs);
        // Error: Max Call Stack Exceeded! Why...? Override Console?
        // console.log("CONTEXT: ", JSON.stringify(context));
        const result = (0, utils_1.evaluateWithContext)(`${formattedCode};
      ${internalTest};`, context);
        // This part is not running for metaTest2...
        console.log("-------result = evaluateWithContext()-------", result);
        console.log("formattedCode", formattedCode);
        console.log("internalTest", internalTest);
        if (!result) {
            throw new Error("did not pass");
        }
    }
    catch (err) {
        userPassed = false;
        // Commented out for debugging
        evaluationError = err;
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
