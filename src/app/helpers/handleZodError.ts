/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources } from "../interfaces/error.types";


export const handleZodError = (err: any) => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((errObj: any) =>
    errorSources.push({
      // path: errObj.path[errObj.path.length - 1],
      path: errObj.path.reverse().join(" inside "),
      message: errObj.message,
    })
  );

  return {
    statusCode: 400,
    message: "Zod Error",
    errorSources,
  };
};
