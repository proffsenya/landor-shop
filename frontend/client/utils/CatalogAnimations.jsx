// client/utils/CatalogAnimations.jsx
import { motion } from "framer-motion";

/** Плавное появление при скролле */
export function ScrollFade({
  children,
  delay = 0,
  duration = 0.6,
  y = 18,
  once = true,
  className = "",
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Слайд + фейд с направления (left/right/up/down) */
export function SlideFade({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 28,
  once = true,
  className = "",
}) {
  const offsets = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };
  const from = offsets[direction] ?? offsets.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Родитель с пошаговым (stagger) появлением детей */
export function StaggerParent({
  children,
  delayChildren = 0,
  stagger = 0.06,
  once = true,
  className = "",
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Элемент сетки — лёгкий подъём + фейд */
export function StaggerItem({
  children,
  duration = 0.45,
  y = 18,
  className = "",
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Нежный hover-эффект карточки */
export function HoverLift({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
