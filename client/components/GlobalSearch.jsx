import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { localSearch } from "@/utils/localSearch";

const allProducts =
  JSON.parse(sessionStorage.getItem("catalog:all") || "[]");

export default function GlobalSearch({
  placeholder = "Искать здесь...",
  dataset = [],
  maxItems = 15,
  className = "",
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
    const results = localSearch(dq, dataset, maxItems);
    setItems(results);
    setActive(0);
    setOpen(results.length > 0);
  }, [dq, dataset, maxItems]);

  // закрытие по клику вне
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (idx = active) => {
    const it = items[idx];
    if (!it) return;
    navigate(it.url || "#");
    setOpen(false);
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
        onFocus={() => items.length && setOpen(true)}
        placeholder={placeholder}
        className="w-96 h-11 pl-4 pr-20 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50"
      />
      <button
        onClick={() => {
          if (items.length) submit(0);
          else navigate(`/catalog?search_query=${encodeURIComponent(q)}`);
        }}
        className="absolute right-0 top-0 bg-[#6F2A2B] text-white px-6 py-3 rounded-r-full hover:bg-[#5a2223]"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg border-[#E6E6E6] overflow-hidden">
          <ul className="max-h-[60vh] overflow-auto py-1">
            {items.map((it, i) => (
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
                  className="w-10 h-10 object-contain bg-gray-50 rounded"
                />
                <div className="min-w-0">
                  <div className="text-sm text-[#1E1E1E] truncate">
                    {it.title}
                  </div>
                  {it.subtitle && (
                    <div className="text-[12px] text-[#8B8B8B] truncate">
                      {it.subtitle}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
