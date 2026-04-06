import { useState, useMemo, useCallback } from "react";

export const useFavoritesSelection = (items) => {
  const [selected, setSelected] = useState(new Set());

  // при изменении списка очищаем выделение для удалённых элементов
  const validSelected = useMemo(() => {
    const itemIds = new Set(items.map(i => i.id));
    return new Set(Array.from(selected).filter(id => itemIds.has(id)));
  }, [items, selected]);

  const toggleOne = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (validSelected.size === items.length && items.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  }, [validSelected, items]);

  const isAllSelected = items.length > 0 && validSelected.size === items.length;
  const selectedIds = Array.from(validSelected);
  const selectedItems = items.filter(i => validSelected.has(i.id));

  return {
    selected: validSelected,
    toggleOne,
    toggleAll,
    isAllSelected,
    selectedIds,
    selectedItems,
  };
};