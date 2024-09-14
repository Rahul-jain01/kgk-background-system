export async function executeWithRetries<T>(fn: () => Promise<T>, maxRetries: number, initialBackoff: number): Promise<T> {
    let attempts = 0;
    let backoff = initialBackoff;
    while (attempts < maxRetries) {
      try {
        return await fn();
      } catch (error:any) {
        attempts++;
        if (attempts >= maxRetries) {
          throw error;
        }
        console.log("warn", "Retrying after error", "", `Attempt ${attempts} failed: ${error?.message}. Retrying in ${backoff} ms...`, "");
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2; // exponential backoff
      }
    }
    throw new Error("Exceeded maximum retries");
  }