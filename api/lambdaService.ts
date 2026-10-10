import { IS_DEVELOPMENT_ENVIRONMENT, LAMBDA_SERVICE_API_KEY, LAMBDA_SERVICE_URL } from "@/constant";

export const getLambdaServiceHeaders = (
  url: string,
  headers?: RequestInit["headers"]
): RequestInit["headers"] => {
  if (url !== LAMBDA_SERVICE_URL) {
    return headers;
  }

  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-api-key", LAMBDA_SERVICE_API_KEY);
  return nextHeaders;
};

// The local Lambda runtime handles one invocation at a time and crashes on
// overlapping requests, so in the development environment Lambda requests
// run one after another. Tail of the chain; it never rejects.
let lambdaRequestChain: Promise<void> = Promise.resolve();

const createAbortError = () => {
  const error = new Error("Aborted while waiting for the previous Lambda request");
  error.name = "AbortError";
  return error;
};

/**
 * Waits until every earlier Lambda request has finished and returns a release
 * function the caller must call once its own request is done. Outside the
 * development environment (or for non-Lambda URLs) it resolves immediately.
 * If `signal` aborts while waiting, it rejects with an AbortError and the
 * request is never sent.
 */
export const acquireLambdaTurn = async (
  url: string,
  signal?: AbortSignal | null
): Promise<() => void> => {
  if (!IS_DEVELOPMENT_ENVIRONMENT || url !== LAMBDA_SERVICE_URL) {
    return () => {};
  }

  const previous = lambdaRequestChain;
  let release!: () => void;
  lambdaRequestChain = new Promise<void>((resolve) => {
    release = resolve;
  });

  try {
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(createAbortError());
        return;
      }
      const onAbort = () => reject(createAbortError());
      signal?.addEventListener("abort", onAbort, { once: true });
      previous.then(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      });
    });
  } catch (e) {
    // Hand the turn on once the previous request is done so later requests
    // keep their order.
    previous.then(release);
    throw e;
  }

  return release;
};

export const runInLambdaQueue = async <T,>(
  url: string,
  task: () => Promise<T>
): Promise<T> => {
  const release = await acquireLambdaTurn(url);
  try {
    return await task();
  } finally {
    release();
  }
};
