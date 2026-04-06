import { useState, useCallback } from "react";

export const useProfileEditing = () => {
  const [editing, setEditing] = useState({
    lastName: false, firstName: false, middleName: false, email: false, phone: false, password: false,
  });
  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const startEditing = useCallback((field) => {
    setEditing(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    if (field === "password") {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  }, []);

  const stopEditing = useCallback((field) => {
    setEditing(prev => ({ ...prev, [field]: false }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  const updatePasswordData = useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    clearFieldError("password");
  }, [clearFieldError]);

  return {
    editing, startEditing, stopEditing,
    errors, setFieldError, clearFieldError,
    passwordData, updatePasswordData,
  };
};