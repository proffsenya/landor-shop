#!/bin/sh
set -e

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
