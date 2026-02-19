import { createContext,Dispatch, SetStateAction } from "react";

export interface BottomNavVisibilityContextType {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
}


// This context will store the visibility state for the Bottom Navigation Bar
export const BottomNavVisibilityContext = createContext<BottomNavVisibilityContextType | undefined>(undefined);
