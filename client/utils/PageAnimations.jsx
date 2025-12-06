// client/utils/PageAnimations.jsx
import { motion, AnimatePresence } from "framer-motion";

/**
 * Анимация появления всей страницы — плавное выцветание и лёгкий сдвиг вверх
 * Используй для контейнера всей страницы корзины или избранного
 */
export function PageFade({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Анимация плавного появления / исчезновения элементов списка (товаров)
 * Используй при добавлении или удалении карточек из корзины или избранного
 */
export function ListMotion({ items, renderItem }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          layout
        >
          {renderItem(item)}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/**
 * Анимация появления всплывающих уведомлений ("товар добавлен", "удалён")
 * @param {boolean} show - Показывать ли уведомление
 * @param {string} children - Текст уведомления
 * @param {string} type - Тип уведомления: "success" (по умолчанию) или "error"
 */
export function ToastMotion({ show, children, type = "success" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] px-4 py-3 sm:px-6 sm:py-3 bg-[#6F2A2B] text-white rounded-lg shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-md"
          style={{ 
            pointerEvents: "auto",
            wordWrap: "break-word"
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
