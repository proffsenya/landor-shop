#!/bin/sh
set -e

# Создаем директорию для SSL сертификатов
mkdir -p /etc/nginx/ssl

# Создаем файлы сертификатов из переменных окружения, если они заданы
if [ -n "$SSL_CERTIFICATE" ]; then
    echo "$SSL_CERTIFICATE" > /etc/nginx/ssl/certificate.crt
    echo "✓ Основной сертификат создан"
fi

if [ -n "$SSL_PRIVATE_KEY" ]; then
    echo "$SSL_PRIVATE_KEY" > /etc/nginx/ssl/private.key
    chmod 600 /etc/nginx/ssl/private.key
    echo "✓ Приватный ключ создан"
fi

if [ -n "$SSL_INTERMEDIATE" ]; then
    echo "$SSL_INTERMEDIATE" > /etc/nginx/ssl/intermediate.crt
    echo "✓ Промежуточный сертификат создан"
fi

# Создаем fullchain.crt (certificate + intermediate)
if [ -n "$SSL_CERTIFICATE" ] && [ -n "$SSL_INTERMEDIATE" ]; then
    cat /etc/nginx/ssl/certificate.crt /etc/nginx/ssl/intermediate.crt > /etc/nginx/ssl/fullchain.crt
    echo "✓ Объединенный сертификат (fullchain) создан"
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
