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
  // let tryBlockResult;
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

    //
    // if (
    //   typeof result === "boolean" &&
    //   result !== metaTestExpectPasses &&
    //   result === true
    // ) {
    //   descriptionMessage = `ERROR: metaTest ${metaTestId} & internalTest ${internalTest.id} are UNEXPECTEDLY ${result}`;
    //   userPassed = false;
    //   evaluationError = { message: null, stack: null };
    // }

    // AKA if result is correct as expected

    // if Error, catch is run...
  } catch (err) {
    // if (typeof result !== "boolean") {
    //   userPassed = false;
    //   descriptionMessage = `ERROR: FAILED metaTest ${metaTestId} & internalTest ${
    //     internalTest.id
    //   } are type: ${(typeof result).toUpperCase()}, should be BOOLEAN`;
    // }
    // if Code fails to compile in try block, this can be normal for some EXPECTED negatives
    descriptionMessage = `CATCH BLOCK ERROR: TEST EVALUATOR, result = evaluateWithContext`;
    userPassed = false;
    evaluationError = {
      message: `${err.name}: ${err.message}`,
      stack: err.stack,
    };
  } finally {
    // console.log("---expectPasses: ", expectPasses);
    console.log("\n<FINALLY RESULT>", result);
    console.log("<FINAL TYPE>", typeof result, "\n");
    console.log("<metaTestExpectPasses>", metaTestExpectPasses);
    console.log("<metaTestId>", metaTestId);
    console.log("<internalTest.id>", internalTest.id);
    console.log("<metaLabel>", metaLabel);
    // Error on vsCode, but ok in run...??? Because object isn't fetched til RUNTIME
    // console.log("<testLabel>", internalTest.label, "\n");

    // console.log("<evaluationError>", evaluationError);
    if (typeof result === "boolean" && result === metaTestExpectPasses) {
      // if result is a boolean, and DOES match EXPECTED example outcome
      evaluationError = { message: null, stack: null };
      descriptionMessage = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are ${result}, as EXPECTED`;
    } else if (typeof result === "boolean" && result !== metaTestExpectPasses) {
      // if result is a boolean, but does NOT match EXPECTED example outcome
      userPassed = false;
      descriptionMessage = `ERROR: FAILED metaTest ${metaTestId} & internalTest ${internalTest.id} are ${result}, which is UNEXPECTED`;
      evaluationError = { message: null, stack: null };
    } else if (typeof result !== "boolean" && evaluationError === undefined) {
      // if result type non-boolean, but no runtime error. Ex: type = string
      userPassed = false;
      descriptionMessage = `ERROR: FAILED metaTest ${metaTestId} & internalTest ${
        internalTest.id
      } are type: ${(typeof result).toUpperCase()}, should be BOOLEAN`;
      evaluationError = { message: null, stack: null };
    }
  }
  // if (typeof result === "undefined") {
  //   console.log("-----FINALLY END----------------");
  // }

  restoreConsoleLog();
  // console.log("<description>", descriptionMessage);
  return {
    error: evaluationError,
    // metaCaseCode: metaCaseCode,
    // internalTest: internalTestCode,
    finalPass: userPassed,
    description: descriptionMessage,
    resultType: typeof result,
    tryBlockResult: result,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
