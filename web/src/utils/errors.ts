import axios from 'axios';

/**
 * Technical keywords that should never be presented to end users
 */
const SENSITIVE_ERROR_PATTERNS = [
  /java\./i,
  /org\.hibernate/i,
  /org\.springframework/i,
  /sql/i,
  /exception/i,
  /stacktrace/i,
  /nullpointer/i,
  /constraintviolation/i,
  /column.*not found/i,
  /table.*doesn't exist/i,
];

/**
 * Sanitizes backend error messages to prevent leaking stack traces or internal implementation details
 */
export const sanitizeErrorMessage = (message: string, fallback: string): string => {
  if (!message || typeof message !== 'string') return fallback;

  // Check if message contains any sensitive technical or SQL pattern
  const isTechnical = SENSITIVE_ERROR_PATTERNS.some((pattern) => pattern.test(message));
  if (isTechnical) {
    return fallback;
  }

  return message.trim();
};

/**
 * Extracts a user-friendly, safe error message from an API response or unknown error
 */
export const getApiErrorMessage = (
  error: unknown,
  defaultMessage = 'An unexpected error occurred. Please try again.'
): string => {
  if (!error) return defaultMessage;

  if (axios.isAxiosError(error)) {
    // Network / Offline / Timeout failure
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'Request timed out. The server took too long to respond. Please try again.';
      }
      return 'Unable to reach the server. Please check your network connection and try again.';
    }

    const status = error.response.status;
    const responseData = error.response.data as { message?: string; error?: string } | undefined;
    const rawMessage = responseData?.message || responseData?.error;

    // HTTP Status-specific friendly messages
    if (status === 401) {
      return 'Your session has expired or you are not logged in. Please log in again.';
    }

    if (status === 403) {
      return 'You do not have permission to access this resource or perform this action.';
    }

    if (status === 404) {
      return rawMessage ? sanitizeErrorMessage(rawMessage, 'The requested resource was not found.') : 'The requested resource was not found.';
    }

    if (status === 409) {
      return rawMessage
        ? sanitizeErrorMessage(rawMessage, 'A conflict occurred with the current state of this resource.')
        : 'A conflict occurred. The resource may already exist or has been modified.';
    }

    if (status === 400 || status === 422) {
      return rawMessage
        ? sanitizeErrorMessage(rawMessage, 'Invalid request data. Please check your inputs.')
        : 'Invalid request data. Please check your inputs.';
    }

    if (status >= 500) {
      return 'A server error occurred. Our team has been notified. Please try again later.';
    }

    if (rawMessage) {
      return sanitizeErrorMessage(rawMessage, defaultMessage);
    }
  }

  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message, defaultMessage);
  }

  if (typeof error === 'string') {
    return sanitizeErrorMessage(error, defaultMessage);
  }

  return defaultMessage;
};
