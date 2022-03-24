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
  metaTestExpectPasses: boolean;
  internalTest?: object;
  removeComments?: boolean;
};

export const runTestEvaluator = async ({
  metaCaseCode,
  internalTestCode,
  metaLabel,
  challengeLabel,
  metaTestId,
  metaTestExpectPasses,
  internalTest,
  removeComments,
}: runTestEvaluatorProps) => {
  let userPassed = true;
  let evaluationError;
  let descriptionMessage;
  const formattedCode = getCode(metaCaseCode, removeComments);
  // console.log(
  //   `-----
  //   \n<debug internalTest-evaluator.ts>
  //   \n PARAM TYPE: <${typeof internalTest}>,
  //   \n <TEST PARAM>${JSON.stringify(internalTest)}
  //   \n-------`
  // );
  const logs = [] as Array<unknown>;
  // Checking Params in Finally Block too

  overrideConsoleLog((args) => {
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
    const context = getEvaluationContext(formattedCode, logs);

    // Error: Max Call Stack Exceeded! Why...? Override Console?
    // console.log("CONTEXT: ", JSON.stringify(context));

    result = evaluateWithContext(
      `${formattedCode};
      ${internalTestCode};`,
      context
    );

    if (typeof result === "boolean" && result === false) {
      userPassed = false;
      evaluationError = { message: null, stack: null };
    }

    if (typeof result === "boolean" && result === metaTestExpectPasses) {
      evaluationError = { message: null, stack: null };
      descriptionMessage = `metaTest ${metaTestId} & internalTest ${internalTest.id} are SUCCESSFULLY ${metaTestExpectPasses}, as EXPECTED`;
    } else if (typeof result === "boolean" && result !== metaTestExpectPasses) {
      userPassed = false;
      descriptionMessage = `metaTest ${metaTestId} & internalTest ${internalTest.id} are FALSELY ${metaTestExpectPasses}, which is UNEXPECTED`;
      evaluationError = { message: null, stack: null };
    }

    // if Error, catch is run...
  } catch (err) {
    userPassed = false;
    evaluationError = err;
  } finally {
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
      console.log(
        `"<RESULT TYPE INCORRECT> MUST be a boolean (src/api/code-challenge/content-types/code-challenge/internalTest-evaluator.ts)"\n\n`
      );
    }

    console.log("-----FINALLY END----------------");
  }

  restoreConsoleLog();
  console.log("<description>", descriptionMessage);
  return {
    error: evaluationError,
    // metaCaseCode: metaCaseCode,
    // internalTest: internalTestCode,
    pass: userPassed,
    description: descriptionMessage,
    resultType: typeof result,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
