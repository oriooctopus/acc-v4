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
  let userPassed = null;
  // evalResultShouldBe is more readable on the Final Results of the MetaTest Output.
  // userShouldPass is more readable in this document.

  let userShouldPass = evalResultShouldBe;
  let descriptionMessage;
  const formattedCode = getCode(metaCaseCode, removeComments);
  const logs = [] as Array<unknown>;

  overrideConsoleLog((args) => {
    logs.push(args);
    // @ts-expect-error will fix later
    console.standardLog("args", ...args);
  });
  console.log("\n<challengeLabel>", challengeLabel);
  console.log("\n\n<<METATEST CODE>>", metaCaseCode);
  console.log("<formattedCode>", formattedCode);
  console.log("<formattedCode TYPE>", typeof formattedCode);
  console.log("<internalTestCode>", internalTestCode, "\n\n");
  let result;
  let evalError = null;

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
    // console.log("---expectPasses: ", expectPasses);
    // console.log("\n<FINALLY RESULT>", result);
    // console.log("<FINAL TYPE>", typeof result, "\n");
    // console.log("<userShouldPass>", userShouldPass);
    console.log("<metaTestId>", metaTestId);
    console.log("<internalTest.id>", internalTest.id);
    // console.log("<metaLabel>", metaLabel);
    console.log("<evalError>", evalError);

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
  }

  restoreConsoleLog();
  // console.log("<description>", descriptionMessage);
  return {
    error: evalError,
    // metaCaseCode: metaCaseCode,
    // internalTest: internalTestCode,
    userPassed: userPassed,
    description: descriptionMessage,
    resultType: typeof result,
    evalResult: result,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
