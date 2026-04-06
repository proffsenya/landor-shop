import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const EmptyCart = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 sm:py-16"
  >
    <img src="/empty.svg" alt="Корзина пуста" className="h-auto mb-4 w-60 sm:w-72" />
    <p className="text-[16px] sm:text-[18px] mb-3 sm:mb-4">Корзина ждёт товаров</p>
    <Link to="/catalog" className="bg-[#6F2A2B] text-white px-5 py-2.5 rounded-full hover:bg-[#5a2223]">
      За покупками
    </Link>
  </motion.div>
);