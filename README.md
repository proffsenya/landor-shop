# Landor Shop

## Технологии

- **Frontend**: React 18 + React Router 6 + JavaScript + Vite + TailwindCSS 3
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons
- **Сборка**: Vite
- **Пакетный менеджер**: npm

## Структура проекта

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.jsx = home)
├── components/ui/        # Pre-built UI component library
├── App.jsx               # App entry point with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles
```

## Команды разработки

```bash
npm install              # Установка зависимостей
npm run dev              # Запуск dev сервера (http://localhost:8080)
npm run build            # Сборка для продакшена
npm run preview          # Предварительный просмотр продакшен сборки
```

## Запуск проекта

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите dev сервер:
   ```bash
   npm run dev
   ```

3. Откройте браузер по адресу: http://localhost:8080

## Особенности

- ✅ Простой запуск через `npm run dev`
- ✅ Современный UI с TailwindCSS
- ✅ Адаптивный дизайн
- ✅ Готовые UI компоненты
- ✅ React Router для навигации
