"use strict";
// andy - Not Directly Used in MetaTests
// import { renderToStaticMarkup } from 'react-dom/server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatMap = exports.removeEmpty = exports.isExternalURL = exports.getErrorMessage = exports.decodeBase64String = exports.encodeToBase64String = void 0;
// you have to call the inner part and access it
// and actually you'll have to go through every key too
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encodeToBase64String = (value) => btoa(JSON.stringify(value));
exports.encodeToBase64String = encodeToBase64String;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeBase64String = (base64String) => JSON.parse(atob(base64String));
exports.decodeBase64String = decodeBase64String;
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
exports.getErrorMessage = getErrorMessage;
const isExternalURL = (url) => {
    if (typeof location === 'undefined') {
        return true;
    }
    const domain = function (url) {
        return url.replace('http://', '').replace('https://', '').split('/')[0];
    };
    return domain(location.href) !== domain(url);
};
exports.isExternalURL = isExternalURL;
// Not Directly Used in MetaTests
// export const renderSvgToCss = (svg: React.ReactElement) => {
//   const staticMarkupSvg = renderToStaticMarkup(svg).replace(/"/g, "'");
//   return `url("data:image/svg+xml; utf8, ${staticMarkupSvg}")`;
// };
// to be passed into filter
const removeEmpty = (value) => {
    return value !== null && value !== undefined;
};
exports.removeEmpty = removeEmpty;
function flatMap(array, callbackfn) {
    return Array.prototype.concat(...array.map(callbackfn));
}
exports.flatMap = flatMap;
