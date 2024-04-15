export const errorHandler = (statusCode, code, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.code = code;
  error.message = message;
};
