import { useState } from "react";

export const useToast = (initialDuration = 3000) => {
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, duration = initialDuration, type = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => {
      setToast("");
      setToastType("success");
    }, duration);
  };

  return { toast, toastType, showToast };
};