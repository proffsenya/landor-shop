import { DEFAULT_AVATAR } from "@/constants/profileConstants";

export const ProfileAvatar = ({ firstName }) => (
  <div className="flex flex-col items-center mt-4 sm:mt-5">
    <img src={DEFAULT_AVATAR} alt="Аватар" className="w-[96px] h-[96px] sm:w-[140px] sm:h-[140px] rounded-full object-cover border-2 border-[#E8E8E8]" />
    <div className="mt-3 text-[16px] sm:text-[18px] font-semibold text-[#1E1E1E]">{firstName || "Иван"}</div>
  </div>
);