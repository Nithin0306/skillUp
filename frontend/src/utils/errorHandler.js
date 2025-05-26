// Enhanced error handling utility
export class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

export const handleAPIError = (error, endpoint) => {
  console.error(`API Error at ${endpoint}:`, error);

  // Safely check environment
  const isProduction =
    typeof process !== "undefined" && process.env
      ? process.env.NODE_ENV === "production"
      : typeof window !== "undefined" &&
        window.location.hostname !== "localhost";

  // Log to external service in production (e.g., Sentry)
  if (isProduction) {
    // Example: Sentry.captureException(error)
  }

  // Return user-friendly error messages
  const errorMessages = {
    400: "Invalid request. Please check your input.",
    401: "Authentication failed. Please try again.",
    403: "Access forbidden. The service may be temporarily unavailable.",
    404: "Service not found. Please try again later.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service maintenance in progress. Please try again later.",
  };

  const status = error.status || 500;
  return (
    errorMessages[status] || "An unexpected error occurred. Please try again."
  );
};

export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i); // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
