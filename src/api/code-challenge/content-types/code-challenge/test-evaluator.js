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
const runTestEvaluator = ({ metaCaseCode, internalTestCode, metaLabel, challengeLabel, metaTestId, metaTestExpectPasses, internalTest, removeComments, }) => __awaiter(void 0, void 0, void 0, function* () {
    let userPassed = true;
    let evaluationError;
    let descriptionMessage;
    const formattedCode = (0, utils_1.getCode)(metaCaseCode, removeComments);
    // console.log(
    //   `-----
    //   \n<debug internalTest-evaluator.ts>
    //   \n PARAM TYPE: <${typeof internalTest}>,
    //   \n <TEST PARAM>${JSON.stringify(internalTest)}
    //   \n-------`
    // );
    const logs = [];
    // Checking Params in Finally Block too
    (0, utils_1.overrideConsoleLog)((args) => {
        // Disabled for easier console reading
        // logs.push(args);
        // @ts-expect-error will fix later
        // console.standardLog("args", ...args);
    });
    console.log("\n<challengeLabel>", challengeLabel);
    console.log("\n\n<<METATEST CODE>>", metaCaseCode);
    console.log("<formattedCode>", formattedCode);
    console.log("<formattedCode TYPE>", typeof formattedCode);
    console.log("<internalTestCode>", internalTestCode, "\n\n");
    let result;
    try {
        // @ts-expect-error will fix later
        const context = (0, utils_1.getEvaluationContext)(formattedCode, logs);
        // Error: Max Call Stack Exceeded! Why...? Override Console?
        // console.log("CONTEXT: ", JSON.stringify(context));
        result = (0, utils_1.evaluateWithContext)(`${formattedCode};
      ${internalTestCode};`, context);
        if (typeof result === "boolean" && result === false) {
            userPassed = false;
            evaluationError = { message: null, stack: null };
        }
        if (typeof result === "boolean" && result === metaTestExpectPasses) {
            evaluationError = { message: null, stack: null };
            descriptionMessage = `metaTest ${metaTestId} & internalTest ${internalTest.id} are SUCCESSFULLY ${metaTestExpectPasses}, as EXPECTED`;
        }
        else if (typeof result === "boolean" && result !== metaTestExpectPasses) {
            userPassed = false;
            descriptionMessage = `metaTest ${metaTestId} & internalTest ${internalTest.id} are FALSELY ${metaTestExpectPasses}, which is UNEXPECTED`;
            evaluationError = { message: null, stack: null };
        }
        // if Error, catch is run...
    }
    catch (err) {
        userPassed = false;
        evaluationError = err;
    }
    finally {
        // console.log("---expectPasses: ", expectPasses);
        console.log("\n<FINALLY RESULT>", result);
        console.log("<FINAL TYPE>", typeof result, "\n");
        console.log("<metaTestId>", metaTestId);
        console.log("<internalTest.id>", internalTest.id);
        console.log("<metaLabel>", metaLabel);
        // Error on vsCode, but ok in run...??? Because object isn't fetched til RUNTIME
        // console.log("<testLabel>", internalTest.label, "\n");
        if (typeof result !== "boolean") {
            console.log("\n\n<FINAL TYPE>", typeof result);
            // Change to error later
            console.log(`"<RESULT TYPE INCORRECT> MUST be a boolean (src/api/code-challenge/content-types/code-challenge/internalTest-evaluator.ts)"\n\n`);
        }
        console.log("-----FINALLY END----------------");
    }
    (0, utils_1.restoreConsoleLog)();
    console.log("<description>", descriptionMessage);
    return {
        error: evaluationError,
        // metaCaseCode: metaCaseCode,
        // internalTest: internalTestCode,
        pass: userPassed,
        description: descriptionMessage,
    };
});
exports.runTestEvaluator = runTestEvaluator;
if (typeof self !== "undefined") {
    self.postMessage({ type: "contentLoaded" });
}
