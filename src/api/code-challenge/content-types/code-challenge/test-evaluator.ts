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
  internalTest: { id: number };
  removeComments?: boolean;
};

export const runTestEvaluator = async ({
  metaCaseCode,
  internalTestCode,
  metaTestId,
  evalResultShouldBe,
  internalTest,
  removeComments,
}: runTestEvaluatorProps) => {
  const setShortError = () => {
    return `${evalError.stack.substring(0, 250)} --- (End of Abridged Error)`; // TS Compile Error: Object is of type 'unknown'.
  };

  const setNoError = () => {
    return "no eval() error detected";
  };

  const assignReturnObject = () => {
    let userPassed = null;
    let description;
    // console.log("<evalError>", evalError);
    switch (true) {
      case evalResultShouldBe === false:
        description = `FAIL: Failing Examples currently not supported`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        return {
          evalError: evalError,
          userPassed: userPassed,
          description: description,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case typeof evalResult === "string":
        description = `FAIL: EvalResultType should be 'boolean', but currently is 'string',\nSuggestion: Check for extra quotes around internal/metaCaseCodes`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        return {
          evalError: evalError,
          userPassed: userPassed,
          description: description,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case typeof evalResult !== "boolean" && typeof evalResult !== "string":
        description = `FAIL: EvalResultType should always be 'boolean' but is currently '${typeof evalResult}'.`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        return {
          evalError: evalError,
          userPassed: userPassed,
          description: description,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case evalResult === true:
        description = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are 'true', as EXPECTED`;
        userPassed = true;
        evalError = evalError ? setShortError() : setNoError();
        return {
          evalError: evalError,
          userPassed: userPassed,
          description: description,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case evalResult === false:
        description = `FAIL: metaTest ${metaTestId} & internalTest ${internalTest.id} 'false', which is UNEXPECTED`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        return {
          evalError: evalError,
          userPassed: userPassed,
          description: description,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
    }
  };

  let evalResult: unknown;
  let evalError: unknown; // evalError is declared here with unknown type
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

    evalResult = evaluateWithContext(
      `${formattedCode};
      ${internalTestCode};`,
      context
    );
  } catch (err) {
    evalError = err; // evalError is assigned here with either type Error Object or undefined if no "err" is caught
  }

  restoreConsoleLog();
  return assignReturnObject();
};
