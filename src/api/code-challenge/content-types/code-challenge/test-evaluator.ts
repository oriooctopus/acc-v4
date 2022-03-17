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
  // Checking Params

  // console.log("***formattedCode", formattedCode);
  // console.log("***evaluationError", evaluationError);
  // console.log("---expectPasses: ", expectPasses);
  // logs.push("test this");
  // console.log("***logs", logs);
  // console.log("***code***", code);
  // console.log("***internalTest***", internalTest);
  // console.log("***removeComments***", removeComments);

  overrideConsoleLog((args) => {
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

    result = evaluateWithContext(
      `${formattedCode};
      ${internalTest};`,
      context
    );
    // if Error, catch is run...
    console.log(
      "\n\n",
      "<test-evaluator.ts TRY BLOCK RESULT>".toUpperCase(),
      result,
      "\n\n ------------------------"
    );
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
  } catch (err) {
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
  } finally {
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
      console.log(
        `"<RESULT TYPE INCORRECT> MUST be a boolean (src/api/code-challenge/content-types/code-challenge/test-evaluator.ts)"\n\n`
      );
    } else if (result === false) {
      // throw new Error("did not pass");
      console.log(`original: 'did not pass'`);
    }
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
