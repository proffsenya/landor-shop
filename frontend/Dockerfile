# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json pnpm-lock.yaml ./
COPY vite.config.js tailwind.config.js postcss.config.js components.json ./

# Устанавливаем pnpm
RUN npm install -g pnpm

# Устанавливаем зависимости
# Используем --no-frozen-lockfile для автоматического обновления lockfile если нужно
RUN pnpm install --no-frozen-lockfile

# Копируем исходный код
COPY client ./client
COPY public ./public
COPY index.html ./

# Собираем проект
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

