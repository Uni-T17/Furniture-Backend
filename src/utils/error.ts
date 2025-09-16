export const createError = (msg: string, status: number, code: string) => {
  const error: any = new Error(msg);
  error.status = status;
  error.code = code;
  return error;
};
