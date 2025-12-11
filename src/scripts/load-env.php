<?php
/**
 * Простая загрузка переменных окружения из .env файла
 * Работает без composer и дополнительных зависимостей
 * 
 * Файл .env должен находиться в корне проекта (sk-rosa/.env)
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

// Загружаем .env из корня проекта
// Путь: sk-rosa/.env (на 2 уровня выше scripts)
$envPath = dirname(dirname(__DIR__)) . '/.env';
loadEnv($envPath);

