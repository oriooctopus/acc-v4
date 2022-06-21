import {
  evaluateWithContext,
  getCode,
  getEvaluationContext,
  overrideConsoleLog,
  restoreConsoleLog,
} from "../code-challenge/utils";

type runTestEvaluatorProps = {
  metaCaseCode: string;
  internalTestCode: string;
  metaLabel: string;
  challengeLabel: string;
  metaTestId: number;
  evalResultShouldBe: boolean;
  internalTest?: object;
  removeComments?: boolean;
};

export const runTestEvaluator = async ({
  metaCaseCode,
  internalTestCode,
  metaLabel,
  challengeLabel,
  metaTestId,
  evalResultShouldBe,
  internalTest,
  removeComments,
}: runTestEvaluatorProps) => {
  const setShortError = () => {
    evalError.stack = `${evalError.stack.substring(
      0,
      250
    )} --- (End of Abridged Error)`;
  };

  const setNullError = () => {
    evalError = {
      message: null,
      stack: null,
    };
  };

  const determineReturnObject = () => {
    switch (true) {
      case userShouldPass === false:
        descriptionMessage = `FAIL: Failing Examples currently not supported`;
        userPassed = false;
        evalError ? setShortError() : setNullError();
        break;
      case typeof result === "undefined":
        descriptionMessage = `FAIL: UNDEFINED test results during eval()`;
        userPassed = false;
        evalError ? setShortError() : setNullError();
        break;
      case typeof result !== "boolean" && typeof result === "string":
        descriptionMessage = `FAIL: test results in wrong type STRING, Suggestion: Check for extra quotes around internal/metaCaseCodes`;
        userPassed = false;
        setNullError();
        break;
      case typeof result !== "boolean":
        descriptionMessage = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are ${result}, as EXPECTED`;
        userPassed = true;
        setNullError();
        break;
      case typeof result === "boolean" && result && userShouldPass:
        descriptionMessage = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are ${result}, as EXPECTED`;
        userPassed = true;
        setNullError();
        break;
      case typeof result === "boolean" && !result && !userShouldPass:
        descriptionMessage = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are ${result}, as EXPECTED`;
        userPassed = true;
        setNullError();
        break;
      case typeof result === "boolean" && result !== userShouldPass:
        descriptionMessage = `FAIL: test results in boolean: ${result
          .toString()
          .toUpperCase()}, which is UNEXPECTED`;
        userPassed = false;
        setNullError();
        break;
    }
  };
  // evalResultShouldBe is renamed to userShouldPass to improve readability on output vs this file

  let userPassed = null;
  let userShouldPass = evalResultShouldBe;
  let descriptionMessage;
  let result;
  let evalError = null;

  const formattedCode = getCode(metaCaseCode, removeComments);
  const logs = [] as Array<unknown>;

  overrideConsoleLog((args) => {
    logs.push(args);
    // @ts-expect-error will fix later
    console.standardLog("args", ...args);
  });

  try {
    // @ts-expect-error will fix later
    const context = getEvaluationContext(formattedCode, logs);

    result = evaluateWithContext(
      `${formattedCode};
      ${internalTestCode};`,
      context
    );
  } catch (err) {
    evalError = err;
  } finally {
    determineReturnObject();
  }
  restoreConsoleLog();
  return {
    error: evalError,
    userPassed: userPassed,
    description: descriptionMessage,
    resultType: typeof result,
    evalResult: result,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
