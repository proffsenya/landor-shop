# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json ./
COPY vite.config.js tailwind.config.js postcss.config.js components.json ./

# Устанавливаем зависимости используя npm с кешированием для ускорения
# Используем --legacy-peer-deps для совместимости с некоторыми пакетами
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

# Копируем исходный код
COPY client ./client
COPY public ./public
COPY index.html ./

# Собираем проект
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Удаляем дефолтные конфигурации nginx
RUN rm -f /etc/nginx/conf.d/*.conf

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
