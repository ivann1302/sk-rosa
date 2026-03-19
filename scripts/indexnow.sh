#!/bin/bash
# IndexNow — уведомить поисковики об обновлении сайта
# Запускается после деплоя: npm run build && ./scripts/indexnow.sh

KEY="f574564b136f4952a2df2c6f4c126f1b"
HOST="sk-rosa.ru"

curl -s -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"${HOST}\",
    \"key\": \"${KEY}\",
    \"urlList\": [
      \"https://${HOST}/\",
      \"https://${HOST}/plastering\",
      \"https://${HOST}/turnkey-repair\",
      \"https://${HOST}/floor-screed\",
      \"https://${HOST}/airless-painting\",
      \"https://${HOST}/blog\"
    ]
  }"

echo "IndexNow: sent to Yandex"
