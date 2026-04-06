export const FavoritesHeader = ({ isAllSelected, onToggleAll, onRemoveSelected, selectedCount, disabledRemove }) => (
  <div className="flex items-center justify-between mb-2">
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={onToggleAll}
        className="w-4 h-4 accent-[#6F2A2B]"
      />
      <span>Выбрать все</span>
    </label>
    <button
      onClick={onRemoveSelected}
      className="text-[#B00020] text-sm hover:opacity-80 disabled:opacity-40"
      disabled={disabledRemove}
    >
      Удалить выбранные
    </button>
  </div>
);