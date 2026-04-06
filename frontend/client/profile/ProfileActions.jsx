import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { checkAdminAccess } from "@/utils/adminAuth";
import { useNavigate } from "react-router-dom";

export const ProfileActions = ({ isStaff, isSuperUser, onLogout }) => {
  const navigate = useNavigate();
  const handleAdminClick = () => {
    const { hasAccess } = checkAdminAccess();
    navigate(hasAccess ? "/admin" : "/admin/login");
  };
  return (
    <div className="mt-6 pt-4 border-t border-[#E8E8E8] space-y-3">
      {(isStaff || isSuperUser) && (
        <Button onClick={handleAdminClick} className="w-full h-[40px] rounded-lg bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" /> Перейти в админку
        </Button>
      )}
      <Button onClick={onLogout} className="w-full h-[40px] rounded-lg bg-red-600 text-white hover:bg-red-700">Выйти из аккаунта</Button>
    </div>
  );
};