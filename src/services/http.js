/**
 * Minimal shared HTTP layer: one place for fetch, status handling and
 * user-friendly error messages.
 */
export class ApiError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (cause) this.cause = cause;
  }
}

export class MissingDataError extends ApiError {
  constructor(message) {
    super(message);
    this.name = 'MissingDataError';
  }
}

/** Fetch a JSON resource, normalizing network/HTTP/parse failures into ApiError. */
export async function getJSON(url, { signal, service = 'weather service' } = {}) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error; // caller cancels on purpose
    throw new ApiError(
      `Unable to reach the ${service}. Check your internet connection and try again.`,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The ${service} responded with an error (HTTP ${response.status}). Please try again later.`,
      { status: response.status }
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(`The ${service} returned an unreadable response.`, {
      cause: error,
    });
  }
}
