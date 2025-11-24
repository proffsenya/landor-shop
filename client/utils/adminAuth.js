/**
 * Получение токена для админки (приоритет: authToken, затем adminToken)
 * @returns {string|null} Токен или null
 */
export const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  
  // Сначала проверяем authToken (если пользователь залогинен на сайте)
  const authToken = localStorage.getItem("authToken");
  if (authToken && authToken !== "guest") {
    // Проверяем права доступа
    const isStaff = localStorage.getItem("isStaff") === "true";
    const isSuperUser = localStorage.getItem("isSuperUser") === "true";
    if (isStaff || isSuperUser) {
      return authToken;
    }
  }
  
  // Если нет authToken с правами, используем adminToken
  const adminToken = localStorage.getItem("adminToken");
  return adminToken || null;
};

/**
 * Проверка прав доступа для админки
 * @returns {{isStaff: boolean, isSuperUser: boolean, hasAccess: boolean}}
 */
export const checkAdminAccess = () => {
  if (typeof window === "undefined") {
    return { isStaff: false, isSuperUser: false, hasAccess: false };
  }
  
  const isStaff = localStorage.getItem("isStaff") === "true";
  const isSuperUser = localStorage.getItem("isSuperUser") === "true";
  const token = getAdminToken();
  
  return {
    isStaff,
    isSuperUser,
    hasAccess: !!token && (isStaff || isSuperUser),
  };
};

