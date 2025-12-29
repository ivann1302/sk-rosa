#!/bin/bash
# Простой скрипт для проверки Security Headers через curl

echo "🔒 Проверка Security Headers"
echo "============================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# URL для проверки (замените на ваш домен)
URL="${1:-http://localhost}"

echo "Проверяю URL: $URL"
echo ""

# Проверяем заголовки через curl
HEADERS=$(curl -sI "$URL" 2>/dev/null)

if [ -z "$HEADERS" ]; then
    echo -e "${RED}❌ Не удалось получить заголовки${NC}"
    echo "Убедитесь, что сервер запущен и доступен"
    exit 1
fi

# Список ожидаемых заголовков
EXPECTED_HEADERS=(
    "X-XSS-Protection"
    "X-Frame-Options"
    "X-Content-Type-Options"
    "Referrer-Policy"
    "Content-Security-Policy"
    "Strict-Transport-Security"
    "Permissions-Policy"
)

FOUND=0
MISSING=0

echo "Результаты проверки:"
echo "-------------------"

for header in "${EXPECTED_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "^$header:"; then
        VALUE=$(echo "$HEADERS" | grep -i "^$header:" | cut -d: -f2- | sed 's/^[[:space:]]*//')
        echo -e "${GREEN}✅ $header${NC}"
        echo "   Значение: $VALUE"
        ((FOUND++))
    else
        echo -e "${YELLOW}⚠️  $header - не найден${NC}"
        ((MISSING++))
    fi
    echo ""
done

echo "============================"
echo "Найдено: $FOUND из ${#EXPECTED_HEADERS[@]}"
echo "Отсутствует: $MISSING"

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Все заголовки установлены!${NC}"
    exit 0
elif [ $FOUND -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Некоторые заголовки отсутствуют${NC}"
    exit 1
else
    echo -e "${RED}❌ Заголовки не найдены${NC}"
    echo "Возможные причины:"
    echo "  - Модуль mod_headers не включен"
    echo "  - Файл .htaccess не обрабатывается"
    echo "  - Проверьте настройки сервера"
    exit 1
fi

