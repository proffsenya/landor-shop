import { useState, useCallback } from 'react';

export const useCatalogFilters = (availableFilters) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [categoryFilters, setCategoryFilters] = useState({});
  const [catFilters, setCatFilters] = useState({});
  const [dogFilters, setDogFilters] = useState({});
  const [minicatFilters, setMiniCatFilters] = useState({});
  const [minidogFilters, setMiniDogFilters] = useState({});
  const [countryFilters, setCountryFilters] = useState({});
  const [flavorFilters, setFlavorFilters] = useState({});
  const [brandFilters, setBrandFilters] = useState({});
  const [scentFilters, setScentFilters] = useState({});
  const [productTypeFilters, setProductTypeFilters] = useState({});

  // Генерация query-строки из текущих фильтров
  const generateQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    // ... полная логика из оригинального файла (работа с category_cat, breed_, typeoffood_ и т.д.)
    // (здесь нужно аккуратно перенести ~100 строк)
    return params.toString();
  }, [categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters, productTypeFilters, priceFrom, priceTo, searchQuery, availableFilters]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setPriceFrom('');
    setPriceTo('');
    setCategoryFilters({});
    setCatFilters({});
    setDogFilters({});
    setMiniCatFilters({});
    setMiniDogFilters({});
    setCountryFilters({});
    setFlavorFilters({});
    setBrandFilters({});
    setScentFilters({});
    setProductTypeFilters({});
  }, []);

  return {
    searchQuery, setSearchQuery,
    priceFrom, setPriceFrom,
    priceTo, setPriceTo,
    categoryFilters, setCategoryFilters,
    catFilters, setCatFilters,
    dogFilters, setDogFilters,
    minicatFilters, setMiniCatFilters,
    minidogFilters, setMiniDogFilters,
    countryFilters, setCountryFilters,
    flavorFilters, setFlavorFilters,
    brandFilters, setBrandFilters,
    scentFilters, setScentFilters,
    productTypeFilters, setProductTypeFilters,
    generateQueryParams,
    resetFilters,
  };
};