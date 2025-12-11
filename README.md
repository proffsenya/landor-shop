# Landor Shop

Интернет-магазин кормов для животных.

## Структура проекта

```
landor-shop/
├── frontend/          # React фронтенд на Vite
│   ├── client/        # Исходный код React приложения
│   ├── public/        # Статические файлы
│   ├── dist/          # Собранные файлы (не коммитится)
│   ├── Dockerfile     # Docker конфигурация для фронтенда
│   ├── docker-compose.yml  # Docker Compose для фронтенда
│   ├── nginx.conf     # Конфигурация Nginx
│   ├── package.json   # Зависимости фронтенда
│   └── vite.config.js # Конфигурация Vite
├── backend/           # Java бэкенд (в отдельной ветке)
├── docker-compose.yml # Docker Compose для запуска из корня
└── README.md          # Этот файл
```

## Запуск проекта

### Локальная разработка (фронтенд)

```bash
cd frontend
pnpm install
pnpm dev
```

### Docker (фронтенд)

Из корня проекта:
```bash
docker-compose up -d --build
```

Или из папки frontend:
```bash
cd frontend
docker-compose up -d --build
```

Фронтенд будет доступен на `http://localhost:3000`

## Технологии

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Java (Spring Boot)
- **Docker**: Multi-stage build с Nginx

## Ветки

- `main` - основная ветка
- `frontend` - ветка фронтенда
- `backend` - ветка бэкенда
