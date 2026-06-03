SHELL := /usr/bin/env bash
.SHELLFLAGS := -euo pipefail -c

.PHONY: ci deps lint lint-js lint-css test build check-html-count

ci: deps lint test build check-html-count

deps:
	npm ci

lint: lint-js lint-css

lint-js:
	npx eslint "src/scripts/**/*.js"

lint-css:
	npx stylelint "src/styles/**/*.scss"

test:
	npm run test

build:
	NODE_OPTIONS="--max-old-space-size=4096" npm run build:astro:production

check-html-count:
	@FILE_COUNT="$$(find ./public_html -name "*.html" | wc -l)"; \
	echo "HTML файлов в сборке: $$FILE_COUNT"; \
	if [ "$$FILE_COUNT" -lt 260 ]; then \
		echo "ОШИБКА: слишком мало файлов в сборке. Деплой отменен."; \
		exit 1; \
	fi
