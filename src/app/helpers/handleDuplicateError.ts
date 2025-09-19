/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDuplicateError = (err: any) => {
  const matchedArray = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `${matchedArray[1]} already exist`,
  };
};