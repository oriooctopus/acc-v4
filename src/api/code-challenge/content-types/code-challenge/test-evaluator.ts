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
    return `${evalError.stack.substring(0, 250)} --- (End of Abridged Error)`;
  };

  const setNoError = () => {
    return "no eval() error detected";
  };

  const assignReturnObject = () => {
    let userPassed = null;
    let description;

    switch (true) {
      case evalResultShouldBe === false:
        description = `FAIL: Failing Examples currently not supported`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        break;
      case typeof evalResult === "string":
        description = `FAIL: EvalResultType should be 'boolean', but currently is 'string',\nSuggestion: Check for extra quotes around internal/metaCaseCodes`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        break;
      case typeof evalResult !== "boolean" && typeof evalResult !== "string":
        description = `FAIL: EvalResultType should always be 'boolean' but is currently '${typeof evalResult}'.`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        break;
      case evalResult === true:
        description = `SUCCESS: metaTest ${metaTestId} & internalTest ${internalTest.id} are 'true', as EXPECTED`;
        userPassed = true;
        evalError = evalError ? setShortError() : setNoError();
        break;
      case evalResult === false:
        description = `FAIL: metaTest ${metaTestId} & internalTest ${internalTest.id} 'false', which is UNEXPECTED`;
        userPassed = false;
        evalError = evalError ? setShortError() : setNoError();
        break;
    }
    return {
      evalError: evalError,
      userPassed: userPassed,
      description: description,
      evalResultType: typeof evalResult,
      evalResult: evalResult,
    };
  };

  let evalResult: unknown;
  let evalError: unknown;
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
    evalError = err;
  }

  restoreConsoleLog();
  return assignReturnObject();
};
