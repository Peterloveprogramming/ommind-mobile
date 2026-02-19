// import { useFetch } from "@/api/useFetch";
// import {LAMBDA_SERVICE_URL} from "@/constant"
// // import { CreateSupplierInput,GetSupplierInput,Supplier } from "../../types";

// export const useGetSupplier = () => {
//     const {commonFetch,isLoading,data} = useFetch<Supplier>({
//         url: "https://jsonplaceholder.typicode.com/todos/",
//         method:"GET"
//     });

//     //using typescript to define the input here means no mistakes can be made downstream
//     // when actually using our API layer 

//     const getSupplier = (input:GetSupplierInput) => commonFetch({input});
//     return { getSupplier, isLoading, data };
// }

    
// export const useCreateSupplier = () => {
//     const {commonFetch,isLoading,data} = useFetch<Supplier>({
//         url: "http://myserver.com/api/supp  liers/create",
//         method:"POST"
//     })

//     const createSupplier = (input:CreateSupplierInput) => commonFetch({input})
//     return {createSupplier,isLoading,data}
// }