import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function AuthToast({ show, onClose, message = "Для выполнения этого действия необходимо авторизоваться" }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="bg-white border-2 border-[#6F2A2B] rounded-lg shadow-xl p-4">
            <p className="text-gray-900 mb-3 text-sm">{message}</p>
            <Button
              onClick={handleLogin}
              className="w-full bg-[#6F2A2B] hover:bg-[#5a2223] text-white"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Войти
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

