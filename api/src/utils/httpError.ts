export type ApiError = Error & {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
};

export const httpError = (statusCode: number, message: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
};

