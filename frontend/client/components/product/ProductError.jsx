import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const ProductError = ({ catalogLink }) => (
  <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
    <Link to={catalogLink} className="mb-6 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]">
      <ArrowLeft className="w-4 h-4 mr-2" /> В каталог
    </Link>
    <div className="text-[16px] text-[#1E1E1E]">Не удалось загрузить товар.</div>
  </div>
);