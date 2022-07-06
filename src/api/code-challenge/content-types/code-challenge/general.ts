export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  return String(error);
};

export const removeEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};
