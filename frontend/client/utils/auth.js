/**
 * Получение токена авторизации из localStorage
 * @returns {string} Токен авторизации или "guest"
 */
export const getAuthToken = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("authToken") || "guest";
};

