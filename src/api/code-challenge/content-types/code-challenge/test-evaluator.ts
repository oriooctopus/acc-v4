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
  internalTest?: object;
  removeComments?: boolean;
};

export const runTestEvaluator = async ({
  metaCaseCode,
  internalTestCode,
  metaLabel,
  challengeLabel,
  internalTest,
  removeComments,
}: runTestEvaluatorProps) => {
  let userPassed = true;
  let evaluationError;

  // code & formattedCode coming up undefined???
  console.log("\n\n<<METATEST CODE>>", metaCaseCode);
  const formattedCode = getCode(metaCaseCode, removeComments);
  console.log(
    `-----
    \n<debug internalTest-evaluator.ts>  
    \n PARAM TYPE: <${typeof internalTest}>,
    \n <TEST PARAM>${JSON.stringify(internalTest)} 
    \n-------`
  );
  const logs = [] as Array<unknown>;
  // Checking Params in Finally Block too

  overrideConsoleLog((args) => {
    // Disabled for easier console reading
    // logs.push(args);
    // @ts-expect-error will fix later
    // console.standardLog("args", ...args);
  });
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
    // if Error, catch is run...
    console.log(
      "\n",
      "<TEST-EVAL.TS TRY RESULT>",
      result,
      "\n ------------------------"
    );
  } catch (err) {
    userPassed = false;
    evaluationError = err;
  } finally {
    // console.log("---expectPasses: ", expectPasses);
    console.log("\n<FINALLY RESULT>", result);
    console.log("<FINAL TYPE>", typeof result, "\n");
    console.log("\n<challengeLabel>", challengeLabel);
    console.log("<metaLabel>", metaLabel);
    // Error on vsCode, but ok in run...??? Because object isn't fetched til RUNTIME
    console.log("<testLabel>", internalTest.label, "\n");

    console.log("<formattedCode>", formattedCode);
    console.log("<internalTestCode>", internalTestCode);
    console.log("-----FINALLY END----------------");

    if (typeof result !== "boolean") {
      console.log("\n\n<FINAL TYPE>", typeof result);
      // Change to error later
      console.log(
        `"<RESULT TYPE INCORRECT> MUST be a boolean (src/api/code-challenge/content-types/code-challenge/internalTest-evaluator.ts)"\n\n`
      );
    } else if (result === false) {
      // throw new Error("did not pass");
      console.log(`original: 'did not pass'`);
    }
  }

  restoreConsoleLog();

  return {
    error: evaluationError,
    metaCaseCode: metaCaseCode,
    internalTest: internalTestCode,
    pass: userPassed,
  };
};

if (typeof self !== "undefined") {
  self.postMessage({ type: "contentLoaded" });
}
