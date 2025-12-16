// client/utils/ActionAnimations.jsx
import { motion, AnimatePresence } from "framer-motion";

/**
 * Анимация добавления/удаления элемента (например, сердечко, корзина и т.п.)
 * Используется для плавного перехода между состояниями "активно / неактивно"
 */

export function ScalePulse({ active, children }) {
  return (
    <motion.div
      animate={{
        scale: active ? [1, 1.2, 1] : [1, 0.9, 1],
        rotate: active ? [0, -5, 5, 0] : 0,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Анимация появления и исчезновения иконки или отметки
 * (например, при добавлении в корзину / избранное)
 */
export function FadeSwitch({ active, children }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active ? "active" : "inactive"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
