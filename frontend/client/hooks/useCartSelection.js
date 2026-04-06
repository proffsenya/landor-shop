import { useState, useMemo } from "react";

export const useCartSelection = (items) => {
  const [selected, setSelected] = useState(new Set());

  // синхронизируем selected при изменении items (например, после загрузки)
  // обычно выбираем все по умолчанию
  useMemo(() => {
    if (items.length > 0 && selected.size === 0) {
      setSelected(new Set(items.map(i => i.id)));
    }
  }, [items, selected.size]);

  const toggleAll = () => {
    setSelected(prev => prev.size === items.length ? new Set() : new Set(items.map(i => i.id)));
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAllSelected = selected.size === items.length && items.length > 0;
  const selectedItems = items.filter(i => selected.has(i.id));
  const totalCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    selected,
    toggleAll,
    toggleOne,
    isAllSelected,
    selectedItems,
    totalCount,
    totalPrice,
  };
};