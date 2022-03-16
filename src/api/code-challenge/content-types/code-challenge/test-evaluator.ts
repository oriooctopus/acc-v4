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
};

export const runTestEvaluator = async ({
  code,
  internalTest,
  removeComments,
}: runTestEvaluatorProps) => {
  let userPassed = true;
  let evaluationError;
  // console.log("original code", code);
  const formattedCode = getCode(code, removeComments);

  const logs = [] as Array<unknown>;
  // This is logging to console just fine
  // console.log("***formattedCode", formattedCode);
  // console.log("***evaluationError", evaluationError);

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

  try {
    // @ts-expect-error will fix later
    const context = getEvaluationContext(formattedCode, logs);

    // Error: Max Call Stack Exceeded! Why...? Override Console?
    // console.log("CONTEXT: ", JSON.stringify(context));

    const result = evaluateWithContext(
      `${formattedCode};
      ${internalTest};`,
      context
    );

    // This part is not running for metaTest2...
    console.log("-------result = evaluateWithContext()-------", result);
    console.log("formattedCode", formattedCode);
    console.log("internalTest", internalTest);

    if (!result) {
      throw new Error("did not pass");
    }
  } catch (err) {
    userPassed = false;
    // Commented out for debugging
    evaluationError = err;
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
