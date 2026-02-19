import React, { useState, ReactNode } from "react";
import { BottomNavVisibilityContext } from "@/context/BottomNavVisibilityContext";
import { ToastVisibilityContext } from "@/context/useToast";
import Toast from "@/comp/Toast";

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

  return (
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
  );
}
