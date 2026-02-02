#!/bin/bash
# Скрипт для локального тестирования с поддержкой .htaccess

echo "🚀 Запуск локального Apache-совместимого сервера..."
echo ""
echo "⚠️  ВАЖНО: URL для тестирования городских страниц:"
echo "   ✅ http://localhost:8080/turnkey-repair/khimki"
echo "   ❌ НЕ http://localhost:8080/pages/turnkey-repair/khimki.html"
echo ""

cd public_html

# Проверяем наличие PHP
if command -v php >/dev/null 2>&1; then
    echo "✅ PHP найден, запуск сервера на порту 8080..."
    echo ""
    php -S localhost:8080 -t . router.php 2>&1
else
    echo "❌ PHP не установлен!"
    echo ""
    echo "Для установки PHP:"
    echo "  Ubuntu/Debian: sudo apt install php-cli"
    echo "  macOS: brew install php"
    echo ""
    echo "Альтернатива - загрузите на хостинг для тестирования"
fi
