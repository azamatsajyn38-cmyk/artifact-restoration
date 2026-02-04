export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, delay = 1500, backoff = 2 } = {}
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn();

      // If result is a Response with 4xx status, don't retry — it's a client error
      if (result instanceof Response && result.status >= 400 && result.status < 500) {
        return result;
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const waitMs = delay * Math.pow(backoff, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1}/${retries} failed: ${lastError.message}. Retrying in ${waitMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}
