import { useState, useEffect } from "react";
import { fetchUserProfile, updateUserProfile, changeUserPassword } from "@/services/userService";
import { formatName, formatPhone } from "@/utils/formatting";
import { validateName, validateEmail, validatePhone, validatePassword, validateConfirmPassword } from "@/utils/validation";
import { safeError } from "@/utils/logger";

export const useUserProfile = () => {
  const [user, setUser] = useState({ firstName: "", lastName: "", middleName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProfile();
      setUser({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleName: data.middleName || "",
        email: data.email || "",
        phone: data.phone || "",
      });
      setIsStaff(data.isStaff ?? localStorage.getItem("isStaff") === "true");
      setIsSuperUser(data.isSuperUser ?? localStorage.getItem("isSuperUser") === "true");
      if (data.isStaff !== undefined) localStorage.setItem("isStaff", String(data.isStaff));
      if (data.isSuperUser !== undefined) localStorage.setItem("isSuperUser", String(data.isSuperUser));
    } catch (err) {
      if (err.message === "UNAUTHORIZED") setError("Необходима авторизация");
      else setError("Не удалось загрузить профиль");
      safeError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateField = async (field, rawValue) => {
    let value = rawValue;
    let validator = null;
    if (field === "firstName") { value = formatName(value); validator = () => validateName(value, "Имя"); }
    if (field === "lastName") { value = formatName(value); validator = () => validateName(value, "Фамилия"); }
    if (field === "middleName") { value = formatName(value); validator = () => value.trim() ? validateName(value, "Отчество") : ""; }
    if (field === "email") { validator = () => validateEmail(value); }
    if (field === "phone") { value = formatPhone(value); validator = () => validatePhone(value); }

    const fieldError = validator ? validator() : "";
    if (fieldError) return { success: false, error: fieldError };

    const payload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      middleName: user.middleName || "",
      [field]: field === "phone" ? value.replace(/[\s\-()\+]/g, "").replace(/^8/, "7") : value.trim(),
    };
    try {
      const updated = await updateUserProfile(payload);
      setUser({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        middleName: updated.middleName || "",
        email: updated.email || "",
        phone: updated.phone || "",
      });
      if (field === "email") {
        // обновляем токен, если пришёл новый
        const newToken = updated.token || updated.authToken;
        if (newToken) localStorage.setItem("authToken", newToken);
        window.dispatchEvent(new Event("auth:token-updated"));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const curErr = validatePassword(currentPassword);
    const newErr = validatePassword(newPassword);
    const confErr = validateConfirmPassword(confirmPassword, newPassword);
    if (curErr || newErr || confErr) return { success: false, error: curErr || newErr || confErr };
    try {
      await changeUserPassword(currentPassword, newPassword, confirmPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { user, loading, error, isStaff, isSuperUser, updateField, changePassword, refetch: loadProfile };
};