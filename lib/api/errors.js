/** Extracts a human-readable message from the backend's error envelope
 * ({ success: false, error: { code, message, details } }), falling back
 * to a generic message for network errors or unexpected shapes.
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.error?.message || fallback;
}
