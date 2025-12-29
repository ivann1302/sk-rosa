<?php
/**
 * Упрощенный скрипт для быстрой проверки формы
 * Использование: php test-form-simple.php
 * 
 * Примечание: .env файл должен находиться в корне проекта
 */

$baseUrl = 'http://localhost:8000'; // Измените на ваш URL

// Проверка .env файла
// Скрипт находится в корне проекта
$projectRoot = __DIR__;
$envFile = $projectRoot . '/.env';

// Если .env не найден, пробуем родительскую директорию
if (!file_exists($envFile)) {
    $parentEnvFile = dirname(__DIR__) . '/.env';
    if (file_exists($parentEnvFile)) {
        $envFile = $parentEnvFile;
        $projectRoot = dirname(__DIR__);
    }
}

echo "🧪 Тест отправки формы\n";
echo "=====================\n\n";

// Проверка .env
if (file_exists($envFile)) {
    echo "✅ .env файл найден: $envFile\n";
} else {
    echo "⚠️  .env файл не найден: $envFile\n";
    echo "   Это может привести к ошибке конфигурации\n\n";
}

// 1. Получаем CSRF токен
echo "1. Получение CSRF токена...\n";
$ch = curl_init($baseUrl . '/scripts/api/get-csrf-token.php');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_COOKIEJAR => '/tmp/test_cookies.txt',
    CURLOPT_COOKIEFILE => '/tmp/test_cookies.txt',
    CURLOPT_TIMEOUT => 10,
]);
$csrfResponse = curl_exec($ch);
$csrfHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($csrfHttpCode !== 200) {
    die("❌ Ошибка получения CSRF токена (HTTP $csrfHttpCode)\n");
}

$csrfData = json_decode($csrfResponse, true);
if (!$csrfData || !isset($csrfData['token'])) {
    die("❌ Ошибка получения CSRF токена\n");
}
echo "✅ CSRF токен получен\n\n";

// 2. Отправляем форму
echo "2. Отправка формы...\n";
$formData = [
    'NAME' => 'Тест',
    'PHONE' => '+79991234567',
    'COMMENTS' => 'Тест с локалхоста',
    'property_type' => 'apartment',
    'form_source' => 'Тест',
    'csrf_token' => $csrfData['token']
];

$ch = curl_init($baseUrl . '/scripts/api/send.php');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($formData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_COOKIEJAR => '/tmp/test_cookies.txt',
    CURLOPT_COOKIEFILE => '/tmp/test_cookies.txt',
    CURLOPT_TIMEOUT => 30,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

@unlink('/tmp/test_cookies.txt');

// 3. Результат
echo "HTTP код: $httpCode\n";
$result = json_decode($response, true);

if (!$result) {
    echo "❌ Ответ не является JSON\n";
    echo "Ответ: $response\n";
    if (strpos($response, 'BITRIX24_DOMAIN') !== false) {
        echo "\n⚠️  Ошибка конфигурации: проверьте .env файл в корне проекта\n";
        echo "   Путь: $envFile\n";
    }
    exit(1);
}

echo "Ответ: " . json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

if (isset($result['success']) && $result['success']) {
    echo "✅ УСПЕХ!\n";
    exit(0);
} else {
    echo "❌ ОШИБКА: " . ($result['error'] ?? 'Неизвестная ошибка') . "\n";
    if (isset($result['error_code']) && $result['error_code'] === 'CONFIG_ERROR') {
        echo "⚠️  Проверьте .env файл: $envFile\n";
    }
    exit(1);
}
