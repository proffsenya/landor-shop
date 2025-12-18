#!/bin/sh
set -e

# Создаем директорию для SSL сертификатов
mkdir -p /etc/nginx/ssl

# Если переменные окружения заданы, создаем файлы из них
# Используем printf для правильной обработки многострочных значений
if [ -n "$SSL_CERTIFICATE" ]; then
    printf '%s\n' "$SSL_CERTIFICATE" > /etc/nginx/ssl/certificate.crt
fi

if [ -n "$SSL_PRIVATE_KEY" ]; then
    printf '%s\n' "$SSL_PRIVATE_KEY" > /etc/nginx/ssl/private.key
    chmod 600 /etc/nginx/ssl/private.key
fi

if [ -n "$SSL_INTERMEDIATE" ]; then
    printf '%s\n' "$SSL_INTERMEDIATE" > /etc/nginx/ssl/intermediate.crt
fi

if [ -n "$SSL_ROOT" ]; then
    printf '%s\n' "$SSL_ROOT" > /etc/nginx/ssl/root.crt
fi

# Создаем fullchain.crt если есть certificate и intermediate
if [ -f /etc/nginx/ssl/certificate.crt ] && [ -f /etc/nginx/ssl/intermediate.crt ]; then
    cat /etc/nginx/ssl/certificate.crt /etc/nginx/ssl/intermediate.crt > /etc/nginx/ssl/fullchain.crt
    echo "✓ fullchain.crt создан из certificate.crt и intermediate.crt"
fi

# Если fullchain.crt не создан, но есть certificate, используем только его
if [ ! -f /etc/nginx/ssl/fullchain.crt ] && [ -f /etc/nginx/ssl/certificate.crt ]; then
    cp /etc/nginx/ssl/certificate.crt /etc/nginx/ssl/fullchain.crt
    echo "✓ fullchain.crt создан из certificate.crt"
fi

# Проверяем наличие сертификатов
if [ ! -f /etc/nginx/ssl/fullchain.crt ] || [ ! -f /etc/nginx/ssl/private.key ]; then
    echo "⚠️  Внимание: SSL сертификаты не найдены. HTTPS может не работать."
    echo "   Убедитесь, что переменные SSL_CERTIFICATE и SSL_PRIVATE_KEY заданы в .env файле"
fi

# Проверяем конфигурацию nginx
echo "Проверка конфигурации nginx..."
if nginx -t; then
    echo "✓ Конфигурация nginx корректна"
else
    echo "✗ Ошибка в конфигурации nginx!"
    exit 1
fi

# Запускаем nginx
echo "Запуск nginx..."
exec nginx -g "daemon off;"

