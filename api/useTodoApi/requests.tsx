import { useFetch } from "@/api/useFetch";
import { Todo } from "../types";

type useGetTodoProps ={
    id :string
}
export const useGetTodo = ({id}:useGetTodoProps) => {
    //adding <Supplier> after useFetch will give the "data"value the type Supplier.
    //this really helps to flesh out the quality of life for the API and is part 
    //of creating something that is self documenting. We put Supplier because we know that is
    //what the endpoint will always return 

    const {commonFetch,isLoading,data} = useFetch<Todo>({
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        method:"GET"
    });

    //using typescript to define the input here means no mistakes can be made downstream
    // when actually using our API layer 

    const getTodo = () => commonFetch({});
    return { getTodo, isLoading, data };
}