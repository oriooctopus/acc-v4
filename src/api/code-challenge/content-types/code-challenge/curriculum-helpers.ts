import strip from "strip-comments";

export const removeJSComments = (codeStr: string): string => {
  // TODO: publish type declarations and reenable eslint
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return strip(codeStr) as string;
  } catch (err) {
    return codeStr;
  }
};
