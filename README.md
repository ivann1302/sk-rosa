# SK Rosa - Проект ремонта под ключ

## Структура проекта

```
sk-rosa/
├── src/              # Исходники (разработка)
│   ├── index.html
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   └── ...
├── public_html/      # Деплой (автоматически заполняется)
└── node_modules/    # Зависимости
```

## Установка

```bash
npm install
```

## Разработка

Запускает SASS watch и dev-сервер:

```bash
npm run dev
```

Сервер откроется на `http://localhost:3000/src/index.html`

### Отдельные команды:

- `npm run dev:css` - только компиляция SASS с watch
- `npm run dev:server` - только dev-сервер

## Сборка для деплоя

Собирает проект в `public_html/`:

```bash
npm run build
```

Или:

```bash
npm run deploy
```

Процесс сборки:
1. Очищает `public_html/`
2. Компилирует SASS в production режиме (минифицированный CSS)
3. Копирует все файлы из `src/` в `public_html/`
4. Удаляет исходники SCSS, node_modules, .idea и другие служебные файлы

## Предпросмотр production версии

```bash
npm run preview
```

Сервер откроется на `http://localhost:3000/public_html/index.html`

## Рабочий процесс

1. **Разработка**: Работаете в папке `src/`, запускаете `npm run dev`
2. **Сборка**: Перед деплоем запускаете `npm run build`
3. **Деплой**: Копируете содержимое `public_html/` на сервер

## Линтинг и форматирование

### Проверка кода

```bash
npm run lint          # Проверить JS и SCSS
npm run lint:js       # Только JavaScript
npm run lint:css      # Только SCSS
```

### Автоисправление

```bash
npm run lint:fix      # Исправить все автоматически
npm run lint:js:fix   # Исправить только JS
npm run lint:css:fix  # Исправить только SCSS
```

### Форматирование

```bash
npm run format        # Отформатировать весь код
npm run format:check  # Проверить форматирование
```

## Инструменты разработки

Проект настроен с использованием:

- **ESLint** - линтер для JavaScript
- **Prettier** - форматер кода
- **Stylelint** - линтер для SCSS
- **EditorConfig** - единообразие в редакторах

### VS Code

Рекомендуемые расширения (автоматически предложены):
- ESLint
- Prettier
- Stylelint
- EditorConfig

Настройки автоматически применяются при сохранении файлов.

## Важно

- Все исходники находятся в `src/`
- `public_html/` генерируется автоматически при сборке
- Не редактируйте файлы в `public_html/` напрямую - они будут перезаписаны при следующей сборке
- Перед сборкой автоматически запускается `lint:fix` для проверки кода

