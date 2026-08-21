import { deleteFromCache,getAuthInfo } from "@/utils/helper";
import { getLambdaServiceHeaders } from "@/api/lambdaService";
import { buildLambdaRequestPayload } from "@/utils/requestContext";
import { useRouter } from "expo-router"; // Import useRouter for navigation
import * as Sentry from "@sentry/react-native";
const DEFAULT_FETCH_OPTIONS = {}
// Kept under the backend's recommended 60s+ Lambda timeout so the client
// surfaces a timeout error to the user instead of hanging indefinitely.
const DEFAULT_TIMEOUT_MS = 45000;

type UseFetchProps = {
    url:string;
    method: "GET" | "POST" | "PUT" | "DELETE",
    clearUserInfoFromCacheIfUnauthorized:boolean,
    useAuthFromCache:boolean,
    timeoutMs?: number,
}


type CommonFetch = {
    /** The variables that the endpoint expects to receive */
    input?: {[index:string]:any};
    /** This allows you to override any default options on a case by case basis.
     * think of it like a escape hatch
     * 
     * RequestInit: This type is part of the Fetch API and is used to configure the options for the fetch request. 
     * It can include properties like method, headers, body, etc.
     */
    fetchOptions?: RequestInit
}

export function useFetch <ResultType> ({
        url,
        method,
        clearUserInfoFromCacheIfUnauthorized=true,
        useAuthFromCache=true,
        timeoutMs=DEFAULT_TIMEOUT_MS
    }:UseFetchProps){
    const router = useRouter();

    const commonFetch = async({
        input,
        fetchOptions
    }:CommonFetch)=>{
        console.log("commonFetch request", {
            url,
            method,
            route: input?.route,
            input,
        });

        // Compose an internal timeout with any caller-supplied AbortSignal (e.g.
        // a superseded request) so either can cancel the underlying fetch.
        const timeoutController = new AbortController();
        const callerSignal = fetchOptions?.signal;
        const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
        if (callerSignal) {
            if (callerSignal.aborted) {
                timeoutController.abort();
            } else {
                callerSignal.addEventListener("abort", () => timeoutController.abort(), { once: true });
            }
        }

        try {
            const userInfo = useAuthFromCache ? await getAuthInfo() : null;
            const requestBody = await buildLambdaRequestPayload(input ?? {}, userInfo);
            const headers = getLambdaServiceHeaders(url, fetchOptions?.headers);

            let response: Response;
            try {
                response = await fetch(url,{
                    method,
                    ...DEFAULT_FETCH_OPTIONS,//const
                    ...fetchOptions, // this allows you to override default fetch options on a case by case basis,
                    signal: timeoutController.signal,
                    headers,
                    body:JSON.stringify(requestBody)
                });
            } catch (e) {
                // Caller-superseded requests should propagate as a plain AbortError
                // so callers can distinguish "cancelled" from "failed".
                if (callerSignal?.aborted) {
                    throw e;
                }
                if (timeoutController.signal.aborted) {
                    const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`, { cause: e });
                    timeoutError.name = "TimeoutError";
                    throw timeoutError;
                }
                throw e;
            }

            try{
                const jsonData = await response.json()

                if (!response.ok && !jsonData?.statusCode) {
                    console.error("Response status:",response.status)
                    throw new Error("error occurred while using fetch")
                }

                if (!response.ok) {
                    console.log("commonFetch non-2xx lambda response", {
                        route: input?.route,
                        httpStatus: response.status,
                        lambdaStatusCode: jsonData.statusCode,
                        response: jsonData.response,
                    });
                }

                if (jsonData.statusCode && jsonData.statusCode === 401 && clearUserInfoFromCacheIfUnauthorized){
                    await deleteFromCache("authInfo")
                    router.push("/welcome"); // Redirect to welcome screen
                    throw new Error(`Unauthorized. Status code: ${jsonData.statusCode}`);
                }
                return jsonData as ResultType
            } catch (e){
                console.error("Error occurred while handling response ",e)
                throw new Error("Error occurred while handling response", { cause: e });
            }
        } catch (e) {
            const isSupersededAbort = e instanceof Error && e.name === "AbortError" && callerSignal?.aborted;
            if (!isSupersededAbort) {
                Sentry.captureException(e, { tags: { url, method, route: input?.route } });
            }
            throw e;
        } finally {
            clearTimeout(timeoutId);
        }
    }
    return {commonFetch};
}
