import { deleteFromCache,getAuthInfo } from "@/utils/helper";
import { useRouter } from "expo-router"; // Import useRouter for navigation
const DEFAULT_FETCH_OPTIONS = {}

type UseFetchProps = {
    url:string;
    method: "GET" | "POST" | "PUT" | "DELETE",
    clearUserInfoFromCacheIfUnauthorized:boolean,
    useAuthFromCache:boolean,
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
        useAuthFromCache=true
    }:UseFetchProps){
    const router = useRouter();

    const commonFetch = async({
        input,
        fetchOptions
    }:CommonFetch)=>{

        if (useAuthFromCache){
            const userInfo = await getAuthInfo();
            if (userInfo){
                if (input){
                    input.jwt_token = userInfo.jwtToken
                }
            } 
        }
        
        const response = await fetch(url,{
            method,
            ...DEFAULT_FETCH_OPTIONS,//const
            ...fetchOptions, // this allows you to override default fetch options on a case by case basis,
            body:JSON.stringify(input)
        });

        if (!response.ok){
            console.error("Response status:",response.status)
            throw new Error("error occurred while using fetch")
        }
        try{
            const jsonData = await response.json()
            
            if (jsonData.statusCode && jsonData.statusCode == 401 && clearUserInfoFromCacheIfUnauthorized){
                await deleteFromCache("authInfo")
                router.push("/welcome"); // Redirect to welcome screen
                throw new Error(`Unauthorized. Status code: ${jsonData.statusCode}`);
            }
            return jsonData as ResultType
        } catch (e){  
            console.error("Error occurred while handling response ",e)
            throw new Error("Error occurred while handling response");
        } 
    }
    return {commonFetch};
}
