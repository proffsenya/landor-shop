import { Button } from "@/components/ui/button";

export const PasswordEditSection = ({ editing, passwordData, errors, onPasswordChange, onSave, onCancel }) => {
  if (!editing.password) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="password" value="••••••••" disabled className="h-10 rounded-lg border border-[#E8E8E8] bg-gray-50 px-3 sm:flex-1" />
          <Button variant="outline" onClick={() => onSave()} className="text-[13px] sm:w-auto w-full">Изменить</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <input type="password" value={passwordData.currentPassword} onChange={(e) => onPasswordChange("currentPassword", e.target.value)} placeholder="Текущий пароль" className="h-10 w-full rounded-lg border border-[#E8E8E8] bg-white px-3 ring-1 ring-[#6F2A2B]/20" />
          <input type="password" value={passwordData.newPassword} onChange={(e) => onPasswordChange("newPassword", e.target.value)} placeholder="Новый пароль" className="h-10 w-full rounded-lg border border-[#E8E8E8] bg-white px-3 ring-1 ring-[#6F2A2B]/20" />
          <input type="password" value={passwordData.confirmPassword} onChange={(e) => onPasswordChange("confirmPassword", e.target.value)} placeholder="Подтвердите новый пароль" className="h-10 w-full rounded-lg border border-[#E8E8E8] bg-white px-3 ring-1 ring-[#6F2A2B]/20" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCancel}>Отмена</Button>
          <Button variant="outline" onClick={onSave} className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]">Сохранить</Button>
        </div>
      </div>
      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      <p className="text-xs text-gray-500">Пароль должен содержать минимум 6 символов</p>
    </div>
  );
};