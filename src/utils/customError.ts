export const customError = (msg: string, statusCode: number) => {
  const err = new Error(msg) as any;
  err.statusCode = statusCode;
  throw err;
};
