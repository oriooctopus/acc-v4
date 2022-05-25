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
  let userShouldPass = evalResultShouldBe;
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

  // Idea: Figure out programmatically whether metaCode will throw an error.
  // Tomorrow: make a bool for metaCaseCode errors, if true, allow undefined === userPassed

  // Apr 12
  // Logic: if visibleMetaError !== null, set metaError === true, if metaError === true, undefined <FINALLY result> is a userError
  // logic not yet tested on multiple code-challenges
  let visibleMetaError = null;
  let existsMetaError = false;
  try {
    const metaCheck = eval(formattedCode);
    console.log("<metaCheck>", metaCheck);
  } catch (err) {
    // console.log("<metaCaseCode ERROR>", err);
    visibleMetaError = err;
    existsMetaError = true;
    // if metaError exists, result should be undefined
    // if no metaError, result should be boolean
  } finally {
    console.log("<metaCaseCode ERROR>", visibleMetaError);
    console.log("<existsMetaError>", existsMetaError);
  }

  // Delete Later. Will almost always throw error.
  // try {
  //   const internalCheck = eval(internalTestCode);
  //   console.log("<internalCheck>", internalCheck);
  // } catch (err) {
  //   console.log("<internalTestCode ERROR>", err);
  //   // almost every internalTest will be an Error, partial code
  // }
  let evalErrorContainer = null;
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
    //   result !== userShouldPass &&
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

    evalErrorContainer = err;
    // descriptionMessage = `CATCH BLOCK ERROR: TEST EVALUATOR, result = evaluateWithContext`;
    // userPassed = false;
    // evaluationError = {
    //   message: `${err.name}: ${err.message}`,
    //   stack: err.stack,
    // };
  } finally {
    // console.log("---expectPasses: ", expectPasses);
    console.log("\n<FINALLY RESULT>", result);
    console.log("<FINAL TYPE>", typeof result, "\n");
    console.log("<userShouldPass>", userShouldPass);
    console.log("<metaTestId>", metaTestId);
    console.log("<internalTest.id>", internalTest.id);
    console.log("<metaLabel>", metaLabel);
    console.log("<evalErrorContainer>", evalErrorContainer);

    // Error on vsCode, but ok in run...??? Because object isn't fetched til RUNTIME
    // console.log("<testLabel>", internalTest.label, "\n");

    // console.log("<evaluationError>", evaluationError);

    const setShortError = () => {
      evaluationError = evalErrorContainer;
      evaluationError.stack = evaluationError.stack.substring(0, 200);
    };

    const setNullError = () => {
      evaluationError = {
        message: null,
        stack: null,
      };
    };

    const determineResult = (evalResult) => {
      console.log("evalResult", evalResult);
      return {};
    };

    switch (true) {
      case userShouldPass === false:
        descriptionMessage = `FAIL: Failing Examples currently not supported`;
        userPassed = false;
        setShortError();
        break;
      case typeof result === "undefined":
        descriptionMessage = `FAIL: UNDEFINED test results during eval()`;
        userPassed = false;
        setShortError();
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
    error: evaluationError,
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
