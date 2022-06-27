import { removeJSComments } from "../code-challenge/curriculum-helpers";

type consoleLogOverride = (data: unknown[]) => void;

export const overrideConsoleLog = (override: consoleLogOverride) => {
  console.standardLog = console.log;
  console.log = (...data: unknown[]) => {
    override(data);
    console.standardLog.apply(console, data);
  };
};

export const restoreConsoleLog = () => {
  if (!console.standardLog) {
    throw new Error(
      "Attempted to restore console.log but it has never been overwritten"
    );
  }
  console.log = console.standardLog;
};

const getCodeEvaluationHelpers = (
  logs: Array<Array<unknown>>,
  codeString: string
) => {
  const helpers = {
    wasLoggedToConsole: (val: unknown) => {
      return logs.some((logGroup) => logGroup.some((log) => log === val));
    },
    wasFunctionInvoked: (functionName: string) => {
      return codeString.trim().includes(`${functionName}()`);
    },
    findFirstPassingLineForCondition: ({
      condition,
    }: {
      condition: string;
    }) => {
      debugger;
      const splitCodeString = codeString.split("\n");
      let codeToEvaluate = "";

      for (let i = 0; i < splitCodeString.length; i++) {
        const currentLine = splitCodeString[i];
        codeToEvaluate += i === 0 ? currentLine : `\n${currentLine}`;
        const context = getEvaluationContext(codeToEvaluate);
        const codeWithCondition = `${codeToEvaluate}\n${condition}`;
        const evalResultWithContext = evaluateWithContext(
          codeWithCondition,
          context
        );
        if (evalResultWithContext) {
          return {
            index: i,
            passed: true,
          };
        }
      }

      return {
        index: -1,
        passed: false,
      };
    },
    removeWhitespace: (string: string, i = 0, res = ""): string => {
      if (i >= string.length) return res;
      else if (string[i] == " ")
        return helpers.removeWhitespace(string, i + 1, res);
      else return helpers.removeWhitespace(string, i + 1, (res += string[i]));
    },
  };
  return helpers;
};

export const getEvaluationContext = (
  code: string,
  logs: Array<Array<unknown>> = []
) => {
  const _codeString = `${code}`;
  return {
    _codeEvaluationHelpers: getCodeEvaluationHelpers(logs, _codeString),
    _helpers: getCodeEvaluationHelpers(logs, _codeString),
    _codeString,
    _internalLogs: logs,
  };
};

export const getCode = (code = "", removeComments?: boolean) =>
  removeComments ? removeJSComments(code) : code;

export const evaluateWithContext = (code: string, context = {}) => {
  return function evaluateEval() {
    const contextStr = Object.keys(context)
      .map((key) => `${key} = this.${key}`)
      .join(",");
    const contextDef = contextStr ? `let ${contextStr};` : "";
    const evalString = `${contextDef}${code}`;
    const result = eval(evalString);

    return result;
  }.call(context);
};

export const compareIds = (a: { id: number }, b: { id: number }) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};
