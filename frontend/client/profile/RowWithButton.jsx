import { Button } from "@/components/ui/button";
import { PageFade } from "@/utils/PageAnimations";

export function RowWithButton({
  placeholder,
  value,
  onChange,
  onBlur,
  isEditing,
  onToggle,
  type = "text",
  error = "",
  example = "",
}) {
  return (
    <PageFade>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={!isEditing}
            className={`h-10 rounded-lg border ${
              error ? "border-red-500" : "border-[#E8E8E8]"
            } bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1 ${
              isEditing ? "ring-1 ring-[#6F2A2B]/20" : ""
            }`}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="text-[13px] sm:w-auto w-full"
          >
            {isEditing ? "Сохранить" : "Изменить"}
          </Button>
        </div>
        {example && !isEditing && (
          <p className="text-xs text-gray-500">{example}</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </PageFade>
  );
}