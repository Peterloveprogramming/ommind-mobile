// import React, { createContext, ReactNode, useContext, useState } from "react";

// interface ToastContextType {
//   toast: boolean;
//   setToast: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const ToastContext = createContext<ToastContextType | undefined>(undefined);

// export function ToastProvider({ children }: { children: ReactNode }) {
//   const [toast, setToast] = useState(false);

//   return (
//     <ToastContext.Provider value={{ toast, setToast }}>
//       {children}
//     </ToastContext.Provider>
//   );
// }

// export function useToast() {
//   const context = useContext(ToastContext);
//   if (!context) {
//     throw new Error("useToast must be used within a ToastProvider");
//   }
//   return context;
// }

import { createContext,Dispatch, SetStateAction,useContext } from "react";

export interface ToastContextType {
  toastVisible: boolean;
  showToastMessage: (message: string, success: boolean) => void;
}

// export const BottomNavVisibilityContext = createContext<BottomNavVisibilityContextType | undefined>(undefined);

export const ToastVisibilityContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastVisibilityContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
