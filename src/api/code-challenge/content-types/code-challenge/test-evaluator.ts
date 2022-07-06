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
  internalTestId: number;
  removeComments?: boolean;
};

export const runTestEvaluator = async ({
  metaCaseCode,
  internalTestCode,
  metaTestId,
  evalResultShouldBe,
  internalTestId,
  removeComments,
}: runTestEvaluatorProps) => {
  const getShortError = () => {
    return `${evalError.stack
      ?.toString()
      .substring(0, 250)} --- (End of Abridged Error)`;
  };

  const getNoError = () => {
    return "no eval() error detected";
  };

  const getMetaTestResultObject = () => {
    switch (true) {
      case evalResultShouldBe === false:
        return {
          evalError: evalError ? getShortError() : getNoError(),
          userPassed: false,
          description: `FAIL: Failing Examples currently not supported`,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case typeof evalResult === "string":
        return {
          evalError: evalError ? getShortError() : getNoError(),
          userPassed: false,
          description: `FAIL: EvalResultType should be 'boolean', but currently is 'string',\nSuggestion: Check for extra quotes around internal/metaCaseCodes`,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case typeof evalResult !== "boolean" && typeof evalResult !== "string":
        return {
          evalError: evalError ? getShortError() : getNoError(),
          userPassed: false,
          description: `FAIL: EvalResultType should always be 'boolean' but is currently '${typeof evalResult}'.`,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case evalResult === true:
        return {
          evalError: evalError ? getShortError() : getNoError(),
          userPassed: false,
          description: `SUCCESS: metaTestId ${metaTestId} & internalTestId ${internalTestId} are 'true', as EXPECTED`,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
      case evalResult === false:
        return {
          evalError: evalError ? getShortError() : getNoError(),
          userPassed: false,
          description: `FAIL: metaTestId ${metaTestId} & internalTestId ${internalTestId} 'false', which is UNEXPECTED`,
          evalResultType: typeof evalResult,
          evalResult: evalResult,
        };
    }
  };

  let evalResult: unknown;
  let evalError: Error;
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
    if (err instanceof Error) {
      evalError = err;
    }
  }

  restoreConsoleLog();

  return getMetaTestResultObject();
};
