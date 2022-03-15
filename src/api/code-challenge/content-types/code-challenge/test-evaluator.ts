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
  // logs.push("test this");
  // console.log("***logs", logs);

  overrideConsoleLog((args) => {
    // Doesn't work!
    console.log("---overrideConsoleLog running-----");
    logs.push(args);
    // @ts-expect-error will fix later
    console.standardLog("args", ...args);
  });

  try {
    // @ts-expect-error will fix later
    const context = getEvaluationContext(formattedCode, logs);
    // Not showing up in terminal...???
    console.log("CONTEXT: ", JSON.stringify(context));
    const result = evaluateWithContext(
      `${formattedCode};
      ${internalTest};`,
      context
    );
    if (!result) {
      throw new Error("did not pass");
    }
  } catch (err) {
    userPassed = false;
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
