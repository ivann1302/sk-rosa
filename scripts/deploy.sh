#!/bin/bash
set -e

REMOTE_USER="a1139549"
REMOTE_HOST="sk-rosa.ru"
REMOTE_PATH="/home/a1139549/domains/sk-rosa.ru/public_html/"
LOCAL_PATH="./public_html/"

echo "→ Сборка для хостинга..."
npm run build:hosting

echo "→ Деплой на $REMOTE_HOST..."
rsync -avz --delete \
  --exclude='.gitkeep' \
  -e "ssh -p 22" \
  $LOCAL_PATH \
  $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

echo "✓ Деплой завершён: https://sk-rosa.ru"
