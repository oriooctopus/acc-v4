import {
  evaluateWithContext,
  getCode,
  getEvaluationContext,
  overrideConsoleLog,
  restoreConsoleLog,
} from "../code-challenge/utils";

type runTestEvaluatorProps = {
  code: string;
  internalTest: string;
  removeComments?: boolean;
  expectPasses?: boolean;
};

export const runTestEvaluator = async ({
  code,
  internalTest,
  removeComments,
  expectPasses = true,
}: runTestEvaluatorProps) => {
  let userPassed = true;
  let evaluationError;
  // console.log("original code", code);
  const formattedCode = getCode(code, removeComments);

  const logs = [] as Array<unknown>;
  // This is logging to console just fine
  // console.log("***formattedCode", formattedCode);
  // console.log("***evaluationError", evaluationError);
  console.log("---expectPasses: ", expectPasses);
  // logs.push("test this");
  // console.log("***logs", logs);
  // console.log("***code***", code);
  // console.log("***internalTest***", internalTest);
  // console.log("***removeComments***", removeComments);

  overrideConsoleLog((args) => {
    // Doesn't work!
    // console.log("---overrideConsoleLog running-----");
    logs.push(args);
    // @ts-expect-error will fix later
    console.standardLog("args", ...args);
  });
  let result;
  try {
    // @ts-expect-error will fix later
    const context = getEvaluationContext(formattedCode, logs);

    // Error: Max Call Stack Exceeded! Why...? Override Console?
    // console.log("CONTEXT: ", JSON.stringify(context));
    // gdfgd;

    result = evaluateWithContext(
      `${formattedCode};
      ${internalTest};`,
      context
    );
    // if Error, catch is run...
    console.log("%%%%test-evaluator.ts result", result);
    // if (result === expectPasses) {
    //   console.log(
    //     "\n\n**result === expectPasses**\n\n",
    //     result === expectPasses
    //   );
    //   result = true;
    // }
    // This part is not running for metaTest2...
    console.log("result = evaluateWithContext()", result);
    console.log("formattedCode", formattedCode);
    console.log("internalTest", internalTest);

    // this code will never run due to catch block
    // if (!result) {
    //   throw new Error("did not pass");
    // }
  } catch (err) {
    if (expectPasses === false) {
      console.log("CATCH FUNCTIONING");
      userPassed = false;
      // evaluationError = undefined;
    } else if (expectPasses === true) {
      userPassed = false;
      evaluationError = err;
    }

    console.log("\n\n ----CATCH BLOCK");
    console.log("---expectPasses: ", expectPasses);
    console.log("%%%%test-evaluator.ts result", result);
    console.log("-------result = evaluateWithContext()-------", result);
    console.log("formattedCode", formattedCode);
    console.log("internalTest", internalTest);
  }

  restoreConsoleLog();

  return {
    error: evaluationError,
    test: internalTest,
    pass: userPassed,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
