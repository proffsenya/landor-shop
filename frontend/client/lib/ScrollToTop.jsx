import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Сброс прокрутки до верха страницы при изменении маршрута
    window.scrollTo(0, 0);
  }, [location]);

  return null; // Этот компонент ничего не рендерит
}