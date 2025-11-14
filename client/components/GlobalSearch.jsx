import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { localSearch as originalLocalSearch } from "@/utils/localSearch";

// Улучшенная функция поиска на основе оригинальной
const localSearch = (query, dataset, maxResults = 10) => {
  if (!query || !dataset || dataset.length === 0) return [];

  // Очищаем запрос от знаков препинания и лишних пробелов
  const cleanQuery = query
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // заменяем знаки препинания на пробелы
    .replace(/\s+/g, ' ') // заменяем множественные пробелы на один
    .trim();

  if (!cleanQuery) return [];

  // Создаем очищенный dataset для поиска
  const cleanedDataset = dataset.map(item => ({
    ...item,
    cleanTitle: item.title
      ?.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || ''
  }));

  const results = cleanedDataset.filter(item => {
    return item.cleanTitle.includes(cleanQuery);
  });

  // Возвращаем оригинальные объекты (без cleanTitle)
  return results.slice(0, maxResults).map(({ cleanTitle, ...item }) => item);
};

// Альтернативный вариант - если предыдущий не работает, используем этот:
const localSearchSimple = (query, dataset, maxResults = 5) => {
  if (!query || !dataset || dataset.length === 0) return [];

  const cleanQuery = query.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!cleanQuery) return [];

  const results = dataset.filter(item => {
    const cleanTitle = item.title?.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() || '';
    return cleanTitle.includes(cleanQuery);
  });

  return results.slice(0, maxResults);
};

const allProducts = JSON.parse(sessionStorage.getItem("catalog:all") || "[]");

export default function GlobalSearch({
  placeholder = "Искать здесь...",
  dataset = [],
  maxItems = 5,
  className = "",
  onSelect,
}) {
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 200);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dq) {
      setItems([]);
      setOpen(false);
      return;
    }

    // Пробуем оба варианта поиска
    let results = localSearch(dq, dataset, maxItems);
    
    // Если не нашли результатов, пробуем простой вариант
    if (results.length === 0) {
      results = localSearchSimple(dq, dataset, maxItems);
    }

    // Если все еще нет результатов, используем оригинальный поиск как запасной вариант
    if (results.length === 0 && originalLocalSearch) {
      results = originalLocalSearch(dq, dataset, maxItems);
    }

    setItems(results);
    setActive(0);
    setOpen(results.length > 0 || dq.length > 0);
  }, [dq, dataset, maxItems]);

  // закрытие по клику вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const submit = (idx = active) => {
    const it = items[idx];
    if (!it) return;
    navigate(it.url || "#");
    setOpen(false);
    if (onSelect) onSelect();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
              <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => (items.length > 0 || dq.length > 0) && setOpen(true)}
        placeholder={placeholder}
        className={`h-11 pl-4 pr-20 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50 ${className}`}
      />
      <button
        onClick={() => {
          if (items.length) submit(0);
          else navigate(`/catalog?search_query=${encodeURIComponent(q)}`);
          if (onSelect) onSelect();
        }}
        className="absolute right-0 top-0 h-11 bg-[#6F2A2B] text-white px-6 rounded-r-full hover:bg-[#5a2223] flex items-center justify-center"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg border-[#E6E6E6] overflow-hidden">
          <ul className="max-h-[60vh] overflow-auto py-1">
            {items.length === 0 ? (
              <li className="px-3 py-2 text-center text-gray-500">
                Не найдено
              </li>
            ) : (
              items.map((it, i) => (
                <li
                  key={it.id}
                  onClick={() => submit(i)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                    i === active ? "bg-[#FFF3E0]" : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={it.image || "/korm1.svg"}
                    alt={it.title}
                    className="object-contain w-10 h-10 rounded bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#1E1E1E] truncate">
                      {it.title}
                    </div>
                    {it.subtitle && (
                      <div className="text-[12px] text-[#8B8B8B] truncate">
                        {it.subtitle}
                      </div>
                    )}
                    {it.price && (
                      <div className="text-sm font-semibold text-[#6F2A2B] mt-1">
                        {it.price} ₽
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}