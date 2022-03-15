"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJSComments = void 0;
// @ts-expect-error will fix later
const strip_comments_1 = __importDefault(require("strip-comments"));
const removeHtmlComments = (str) => str.replace(/<!--[\s\S]*?(-->|$)/g, '');
const removeCssComments = (str) => str.replace(/\/\*[\s\S]+?\*\//g, '');
const removeJSComments = (codeStr) => {
    // TODO: publish type declarations and reenable eslint
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return (0, strip_comments_1.default)(codeStr);
    }
    catch (err) {
        return codeStr;
    }
};
exports.removeJSComments = removeJSComments;
const removeWhiteSpace = (str = '') => {
    return str.replace(/\s/g, '');
};
const curriculumHelpers = {
    removeHtmlComments,
    removeCssComments,
    removeWhiteSpace,
};
exports.default = curriculumHelpers;
