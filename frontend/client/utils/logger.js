/**
 * Утилита для логирования с проверкой авторизации
 * console.error и console.warn выводятся только для авторизованных пользователей
 */

import { getAuthToken } from "./auth";

/**
 * Проверяет, авторизован ли пользователь
 * @returns {boolean} true если пользователь авторизован (не guest)
 */
const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  const token = getAuthToken();
  return token && token !== "guest";
};

/**
 * Безопасный console.error - выводится только для авторизованных пользователей
 */
export const safeError = (...args) => {
  if (isAuthenticated()) {
    console.error(...args);
  }
};

/**
 * Безопасный console.warn - выводится только для авторизованных пользователей
 */
export const safeWarn = (...args) => {
  if (isAuthenticated()) {
    console.warn(...args);
  }
};

