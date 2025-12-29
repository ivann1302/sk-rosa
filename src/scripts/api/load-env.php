<?php
/**
 * Простая загрузка переменных окружения из .env файла
 * Работает без composer и дополнительных зависимостей
 * 
 * Файл .env должен находиться в корне сайта (public_html/.env)
 * См. .env.example для примера структуры
 * См. DEPLOY.md для инструкций по настройке
 */
function loadEnv($envFile) {
  if (!file_exists($envFile)) {
    return false;
  }

  $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  
  foreach ($lines as $line) {
    // Пропускаем комментарии
    if (strpos(trim($line), '#') === 0) {
      continue;
    }

    // Разделяем на ключ и значение
    if (strpos($line, '=') !== false) {
      list($key, $value) = explode('=', $line, 2);
      $key = trim($key);
      $value = trim($value);

      // Убираем кавычки если есть
      if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
          (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
        $value = substr($value, 1, -1);
      }

      // Устанавливаем переменную окружения, если её ещё нет
      if (!array_key_exists($key, $_ENV) && !array_key_exists($key, $_SERVER)) {
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv("$key=$value");
      }
    }
  }

  return true;
}

// Загружаем .env из корня проекта или public_html
// Пробуем несколько возможных путей для надежности
$possiblePaths = [
  dirname(dirname(dirname(__DIR__))) . '/.env',  // корень проекта (на 3 уровня выше api/)
  __DIR__ . '/../../../.env',                    // корень проекта (альтернативный путь)
  dirname(dirname(__DIR__)) . '/.env',            // public_html/.env (на 2 уровня выше api/)
  __DIR__ . '/../../.env',                        // public_html/.env (альтернативный путь)
  $_SERVER['DOCUMENT_ROOT'] . '/.env',            // DOCUMENT_ROOT/.env
  dirname($_SERVER['DOCUMENT_ROOT']) . '/.env',   // родительская директория DOCUMENT_ROOT (корень проекта)
];

$envLoaded = false;
$lastError = '';
foreach ($possiblePaths as $envPath) {
  if (file_exists($envPath)) {
    if (is_readable($envPath)) {
      if (loadEnv($envPath)) {
        $envLoaded = true;
        error_log("load-env: Successfully loaded .env from: $envPath");
        break;
      } else {
        $lastError = "Failed to parse .env file: $envPath";
      }
    } else {
      $lastError = "File exists but not readable: $envPath (check permissions)";
    }
  } else {
    $lastError = "File not found: $envPath";
  }
}

// Если не удалось загрузить, логируем предупреждение с проверенными путями
if (!$envLoaded) {
  error_log('load-env: Warning: .env file not found. Checked paths: ' . implode(', ', $possiblePaths));
  error_log('load-env: Last error: ' . $lastError);
  error_log('load-env: __DIR__ = ' . __DIR__);
  error_log('load-env: DOCUMENT_ROOT = ' . ($_SERVER['DOCUMENT_ROOT'] ?? 'not set'));
}

