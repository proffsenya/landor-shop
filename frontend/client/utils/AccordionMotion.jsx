// client/utils/AccordionMotion.jsx
import { motion, AnimatePresence } from "framer-motion";

/**
 * Плавная анимация открытия/закрытия блока.
 * Просто оборачиваешь контент, передаёшь isOpen={true/false}.
 */
export default function AccordionMotion({ isOpen, children }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="accordion"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
