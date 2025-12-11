# Инструкция по деплою фронтенда

## Созданные файлы

- `Dockerfile` - multi-stage сборка фронтенда
- `nginx.conf` - конфигурация nginx для SPA и проксирования API
- `.dockerignore` - исключения для Docker сборки
- `docker-compose.yml` - оркестрация фронтенда и бэкенда

## Локальная сборка и тестирование

### 1. Сборка образа
```bash
docker build -t landor-frontend .
```

### 2. Запуск контейнера
```bash
docker run -p 3000:80 landor-frontend
```

Откройте http://localhost:3000

## Деплой на VPS

### Вариант 1: Используя docker-compose (рекомендуется)

1. На VPS склонируйте репозиторий:
```bash
cd /opt
git clone https://github.com/your-username/landor-shop.git
cd landor-shop
git checkout frontend
```

2. Обновите `docker-compose.yml` - укажите правильный образ/путь для бэкенда

3. Запустите:
```bash
docker-compose up -d --build
```

### Вариант 2: Только фронтенд

1. Соберите образ:
```bash
docker build -t landor-frontend .
```

2. Запустите контейнер:
```bash
docker run -d \
  --name landor-frontend \
  -p 3000:80 \
  --network landor-network \
  landor-frontend
```

**Важно:** Убедитесь, что бэкенд доступен по имени `backend` в Docker сети, или измените `proxy_pass` в `nginx.conf` на IP/имя вашего бэкенда.

## Обновление конфигурации nginx

Если нужно изменить настройки nginx, отредактируйте `nginx.conf` и пересоберите образ.

## Переменные окружения

Если нужно передать переменные окружения в сборку, используйте build args в Dockerfile:

```dockerfile
ARG API_URL
ENV VITE_API_URL=$API_URL
```

И передавайте при сборке:
```bash
docker build --build-arg API_URL=https://api.example.com -t landor-frontend .
```

## Проверка работы

После деплоя проверьте:
- Фронтенд доступен на порту 3000
- API запросы проксируются на бэкенд (проверьте Network в DevTools)
- SPA роутинг работает (переходы по страницам)

