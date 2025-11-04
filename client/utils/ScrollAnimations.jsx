// client/utils/ScrollAnimations.jsx
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

/**
 * Обёртка, которая анимирует дочерние элементы при появлении в области видимости.
 * Просто оберни любой контент в <ScrollReveal>...</ScrollReveal>
 */
export default function ScrollReveal({
  children,
  delay = 0,
  yOffset = 30,
  duration = 0.6,
  once = true,
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: once, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants}>
      {children}
    </motion.div>
  );
}
