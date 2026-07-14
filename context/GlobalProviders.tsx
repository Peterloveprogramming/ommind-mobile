import React, { useState, ReactNode, useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { BottomNavVisibilityContext } from "@/context/BottomNavVisibilityContext";
import { registerGlobalToastHandler, ToastVisibilityContext } from "@/context/useToast";
import Toast from "@/comp/Toast";
import { store } from "@/store";

interface GlobalProvidersProps {
  children: ReactNode;
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(true);

  const showToastMessage = (message: string, success: boolean) => {
    setToastMessage(message);
    setToastSuccess(success);
    setToastVisible(true);
  };

  useEffect(() => {
    registerGlobalToastHandler(showToastMessage);

    return () => {
      registerGlobalToastHandler(null);
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <ToastVisibilityContext.Provider
        value={{ toastVisible, showToastMessage }}
      >
        <BottomNavVisibilityContext.Provider
          value={{ isVisible: isBottomNavVisible, setIsVisible: setIsBottomNavVisible }}
        >
          {children}
          {toastVisible && (
            <Toast
              setToast={setToastVisible}
              message={toastMessage}
              success={toastSuccess}
            />
          )}
        </BottomNavVisibilityContext.Provider>
      </ToastVisibilityContext.Provider>
    </ReduxProvider>
  );
}
