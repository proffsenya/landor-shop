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
 * Анимация появления всплывающих уведомлений (“товар добавлен”, “удалён”)
 */
export function ToastMotion({ show, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-[#6F2A2B] text-white rounded-lg shadow-lg"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
