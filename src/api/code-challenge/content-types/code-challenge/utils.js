"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateWithContext = exports.getConsoleLogsFromCodeEvaluation = exports.getCode = exports.getEvaluationContext = exports.restoreConsoleLog = exports.overrideConsoleLog = void 0;
// Import filepaths changed from original
const curriculum_helpers_1 = require("../code-challenge/curriculum-helpers");
const general_1 = require("../code-challenge/general");
const overrideConsoleLog = (override) => {
    // @ts-expect-error will fix later
    console.standardLog = console.log;
    console.log = (...data) => {
        override(data);
        // @ts-expect-error will fix later
        console.standardLog.apply(console, data); // eslint-disable-line prefer-spread
    };
};
exports.overrideConsoleLog = overrideConsoleLog;
const restoreConsoleLog = () => {
    // @ts-expect-error will fix later
    if (!console.standardLog) {
        throw new Error("Attempted to restore console.log but it has never been overwritten");
    }
    // @ts-expect-error will fix later
    console.log = console.standardLog;
};
exports.restoreConsoleLog = restoreConsoleLog;
const getCodeEvaluationHelpers = (logs, codeString) => {
    const helpers = {
        // right now this only works with primitives
        wasLoggedToConsole: (val) => {
            return logs.some((logGroup) => logGroup.some((log) => log === val));
        },
        wasFunctionInvoked: (functionName) => {
            return codeString.trim().includes(`${functionName}()`);
        },
        /**
         * Evaluates a condition for each line of the provided code.
         * Upon finding a line that passes it returns that line's index
         */
        findFirstPassingLineForCondition: ({ condition, }) => {
            debugger;
            const splitCodeString = codeString.split("\n");
            let codeToEvaluate = "";
            for (let i = 0; i < splitCodeString.length; i++) {
                const currentLine = splitCodeString[i];
                codeToEvaluate += i === 0 ? currentLine : `\n${currentLine}`;
                const context = (0, exports.getEvaluationContext)(codeToEvaluate);
                // Doesn't work? Not logging
                // console.log("******context: ", context);
                const codeWithCondition = `${codeToEvaluate}\n${condition}`;
                if ((0, exports.evaluateWithContext)(codeWithCondition, context)) {
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
        removeWhitespace: (string, i = 0, res = "") => {
            if (i >= string.length)
                return res;
            else if (string[i] == " ")
                return helpers.removeWhitespace(string, i + 1, res);
            else
                return helpers.removeWhitespace(string, i + 1, (res += string[i]));
        },
    };
    return helpers;
};
const getEvaluationContext = (code, logs = []) => {
    const _codeString = `${code}`;
    return {
        _codeEvaluationHelpers: getCodeEvaluationHelpers(logs, _codeString),
        _helpers: getCodeEvaluationHelpers(logs, _codeString),
        _codeString,
        _internalLogs: logs,
    };
};
exports.getEvaluationContext = getEvaluationContext;
const getCode = (code = "", removeComments) => removeComments ? (0, curriculum_helpers_1.removeJSComments)(code) : code;
exports.getCode = getCode;
const getConsoleLogsFromCodeEvaluation = (code) => {
    if (code === undefined) {
        return [];
    }
    const context = (0, exports.getEvaluationContext)(code);
    const logs = [];
    // Disabled for debugging test-evaluator
    // overrideConsoleLog((...args) => {
    //   logs.push(args.toString());
    //   // @ts-expect-error will fix later
    //   console.standardLog("args", ...args);
    // });
    try {
        (0, exports.evaluateWithContext)(`
    ${code};
  `, context);
    }
    catch (e) {
        logs.push((0, general_1.getErrorMessage)(e));
    }
    // Disabled for debugging test-evaluator
    // restoreConsoleLog();
    return logs;
};
exports.getConsoleLogsFromCodeEvaluation = getConsoleLogsFromCodeEvaluation;
// TODO: type context
const evaluateWithContext = (code, context = {}) => {
    // console.log("code: ", code);
    // console.log("Object.keys(context): ", Object.keys(context));
    return function evaluateEval() {
        const contextStr = Object.keys(context)
            .map((key) => `${key} = this.${key}`)
            .join(",");
        // console.log("---contextStr: ", contextStr, "\n\n");
        const contextDef = contextStr ? `let ${contextStr};` : "";
        // console.log("---contextDef: ", contextDef, "\n\n");
        const evalString = `${contextDef}${code}`;
        // console.log(
        //   "contextDef",
        //   contextDef,
        //   "code",
        //   code,
        //   "---evalString:!! ",
        //   JSON.stringify(evalString),
        //   "\n\n"
        // );
        const result = eval(evalString);
        return true;
        // console.log("---result: ", result, "\n\n");
        return result;
    }.call(context);
};
exports.evaluateWithContext = evaluateWithContext;
