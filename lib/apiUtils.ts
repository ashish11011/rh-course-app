import axios from 'axios';

type ApiSuccess<T> = {
  data: T;
  error: null;
  rawError: null;
};

type ApiFailure = {
  data: null;
  error: string;
  rawError: unknown;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function getApiErrorMessage(error: unknown, fallbackMessage = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; error?: string }
      | string
      | undefined;

    if (typeof responseData === 'string') {
      return responseData;
    }

    return responseData?.message || responseData?.error || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

export function isInvalidTokenError(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 401) {
    return false;
  }

  const responseData = error.response.data as
    | { message?: string; error?: string }
    | string
    | undefined;

  const message =
    typeof responseData === 'string'
      ? responseData
      : responseData?.error || responseData?.message;

  return message === 'Unauthorized: Invalid token';
}

export async function tryCatch<T>(
  request: () => Promise<T>,
  fallbackMessage?: string
): Promise<ApiResult<T>> {
  try {
    const data = await request();
    return { data, error: null, rawError: null };
  } catch (error) {
    return {
      data: null,
      error: getApiErrorMessage(error, fallbackMessage),
      rawError: error,
    };
  }
}
