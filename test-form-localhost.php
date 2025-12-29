<?php
/**
 * Скрипт для проверки отправки формы на локалхосте
 * 
 * Использование:
 * 1. Запустите локальный сервер: php -S localhost:8000 -t public_html
 * 2. Откройте в браузере: http://localhost:8000/test-form-localhost.php
 * 
 * Или через командную строку:
 * php test-form-localhost.php
 * 
 * Примечание: .env файл должен находиться в корне проекта (/home/ivan/skrosa/domains/sk-rosa/.env)
 */

// Настройки
$baseUrl = 'http://localhost:8000'; // Измените на ваш URL
$csrfTokenUrl = $baseUrl . '/scripts/api/get-csrf-token.php';
$sendFormUrl = $baseUrl . '/scripts/api/send.php';

// Определяем корень проекта
// Скрипт находится в корне проекта, поэтому используем __DIR__ напрямую
$projectRoot = __DIR__;
$envFile = $projectRoot . '/.env';

// Если .env не найден в текущей директории, пробуем родительскую (для случаев, когда скрипт в поддиректории)
if (!file_exists($envFile)) {
    $parentDir = dirname(__DIR__);
    $parentEnvFile = $parentDir . '/.env';
    if (file_exists($parentEnvFile)) {
        $projectRoot = $parentDir;
        $envFile = $parentEnvFile;
    }
}

// Цвета для вывода (для CLI)
$colors = [
    'green' => "\033[0;32m",
    'red' => "\033[0;31m",
    'yellow' => "\033[1;33m",
    'blue' => "\033[0;34m",
    'reset' => "\033[0m"
];

// Определяем режим (CLI или веб)
$isCli = php_sapi_name() === 'cli';

function colorize($text, $color, $isCli) {
    if ($isCli) {
        global $colors;
        return $colors[$color] . $text . $colors['reset'];
    }
    return $text;
}

function printResult($message, $type = 'info', $isCli = false) {
    $prefix = '';
    $color = 'reset';
    
    switch ($type) {
        case 'success':
            $prefix = '✅';
            $color = 'green';
            break;
        case 'error':
            $prefix = '❌';
            $color = 'red';
            break;
        case 'warning':
            $prefix = '⚠️';
            $color = 'yellow';
            break;
        case 'info':
            $prefix = 'ℹ️';
            $color = 'blue';
            break;
    }
    
    echo colorize("$prefix $message\n", $color, $isCli);
}

// HTML заголовок для веб-версии
if (!$isCli) {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тест отправки формы на локалхосте</title>
    <style>
        body { font-family: monospace; padding: 20px; max-width: 1000px; margin: 0 auto; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .info { color: #2196F3; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; background: #e3f2fd; }
        .result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .result.success { background: #e8f5e9; border-left: 4px solid #4CAF50; }
        .result.error { background: #ffebee; border-left: 4px solid #f44336; }
        .result.warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .result.info { background: #e3f2fd; border-left: 4px solid #2196F3; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Тест отправки формы на локалхосте</h1>';
}

printResult("Начинаем тестирование отправки формы", 'info', $isCli);

// Шаг 0: Проверка .env файла
printResult("Шаг 0: Проверка конфигурации .env", 'info', $isCli);

if (file_exists($envFile)) {
    if (is_readable($envFile)) {
        printResult(".env файл найден: $envFile", 'success', $isCli);
        
        // Проверяем наличие обязательных переменных
        $envContent = file_get_contents($envFile);
        $requiredVars = ['BITRIX24_DOMAIN', 'BITRIX24_WEBHOOK_TOKEN'];
        $missingVars = [];
        
        foreach ($requiredVars as $var) {
            if (strpos($envContent, $var . '=') === false) {
                $missingVars[] = $var;
            }
        }
        
        if (!empty($missingVars)) {
            printResult("В .env отсутствуют переменные: " . implode(', ', $missingVars), 'warning', $isCli);
            printResult("Это может привести к ошибке при отправке формы", 'warning', $isCli);
        } else {
            printResult("Все обязательные переменные найдены в .env", 'success', $isCli);
        }
    } else {
        printResult(".env файл существует, но недоступен для чтения: $envFile", 'error', $isCli);
        printResult("Проверьте права доступа к файлу", 'error', $isCli);
    }
} else {
    printResult(".env файл не найден: $envFile", 'warning', $isCli);
    printResult("Файл должен находиться в корне проекта", 'warning', $isCli);
    printResult("Это может привести к ошибке конфигурации при отправке формы", 'warning', $isCli);
}

// Шаг 1: Получение CSRF токена
printResult("Шаг 1: Получение CSRF токена", 'info', $isCli);

$ch = curl_init($csrfTokenUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_COOKIEJAR => sys_get_temp_dir() . '/test_form_cookies.txt',
    CURLOPT_COOKIEFILE => sys_get_temp_dir() . '/test_form_cookies.txt',
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 10,
]);

$csrfResponse = curl_exec($ch);
$csrfHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$csrfError = curl_error($ch);
curl_close($ch);

if ($csrfError) {
    printResult("Ошибка при получении CSRF токена: $csrfError", 'error', $isCli);
    printResult("Убедитесь, что сервер запущен на $baseUrl", 'error', $isCli);
    exit(1);
}

if ($csrfHttpCode !== 200) {
    printResult("HTTP код при получении CSRF токена: $csrfHttpCode", 'error', $isCli);
    if ($csrfHttpCode === 0) {
        printResult("Сервер недоступен. Запустите: php -S localhost:8000 -t public_html", 'error', $isCli);
    }
    exit(1);
}

$csrfData = json_decode($csrfResponse, true);
if (!$csrfData || !isset($csrfData['token'])) {
    printResult("Не удалось получить CSRF токен. Ответ: $csrfResponse", 'error', $isCli);
    exit(1);
}

$csrfToken = $csrfData['token'];
printResult("CSRF токен получен: " . substr($csrfToken, 0, 20) . "...", 'success', $isCli);

// Шаг 2: Подготовка данных формы
printResult("Шаг 2: Подготовка данных формы", 'info', $isCli);

$formData = [
    'NAME' => 'Тестовый Пользователь',
    'PHONE' => '+7 (999) 123-45-67',
    'COMMENTS' => 'Тестовая заявка с локалхоста',
    'property_type' => 'apartment',
    'form_source' => 'Тест локалхост',
    'csrf_token' => $csrfToken
];

// Опциональные поля для калькулятора
$formData['object_type'] = 'Квартира';
$formData['property_class'] = 'Эконом';
$formData['location'] = 'Москва';

printResult("Данные формы подготовлены", 'success', $isCli);

if (!$isCli) {
    echo '<div class="step"><strong>Данные формы:</strong><pre>' . htmlspecialchars(print_r($formData, true)) . '</pre></div>';
}

// Шаг 3: Отправка формы
printResult("Шаг 3: Отправка формы на сервер", 'info', $isCli);

$ch = curl_init($sendFormUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($formData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_COOKIEJAR => sys_get_temp_dir() . '/test_form_cookies.txt',
    CURLOPT_COOKIEFILE => sys_get_temp_dir() . '/test_form_cookies.txt',
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/x-www-form-urlencoded',
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Очистка временных файлов
@unlink(sys_get_temp_dir() . '/test_form_cookies.txt');

if ($curlError) {
    printResult("Ошибка cURL: $curlError", 'error', $isCli);
    exit(1);
}

// Шаг 4: Анализ ответа
printResult("Шаг 4: Анализ ответа сервера", 'info', $isCli);

printResult("HTTP код ответа: $httpCode", $httpCode === 200 ? 'success' : 'warning', $isCli);

// Пытаемся распарсить JSON, даже если это ошибка
$responseData = json_decode($response, true);

if (!$responseData) {
    // Если ответ не JSON, это может быть ошибка конфигурации
    printResult("Ответ не является валидным JSON", 'error', $isCli);
    printResult("Это может означать ошибку конфигурации сервера", 'warning', $isCli);
    
    // Проверяем типичные ошибки
    if (strpos($response, 'BITRIX24_DOMAIN') !== false || strpos($response, 'Configuration error') !== false) {
        printResult("Обнаружена ошибка конфигурации Bitrix24", 'error', $isCli);
        printResult("Проверьте, что .env файл находится в корне проекта и содержит:", 'warning', $isCli);
        printResult("  - BITRIX24_DOMAIN", 'info', $isCli);
        printResult("  - BITRIX24_WEBHOOK_TOKEN", 'info', $isCli);
        printResult("Путь к .env: $envFile", 'info', $isCli);
    }
    
    printResult("Ответ сервера: $response", 'error', $isCli);
    exit(1);
}

if (!$isCli) {
    echo '<div class="step"><strong>Ответ сервера:</strong><pre>' . htmlspecialchars(json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre></div>';
} else {
    echo "\n" . colorize("Ответ сервера:\n", 'blue', $isCli);
    echo json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
}

// Проверка результата
if (isset($responseData['success']) && $responseData['success'] === true) {
    printResult("✅ УСПЕХ! Форма отправлена успешно", 'success', $isCli);
    if (isset($responseData['lead_id'])) {
        printResult("ID лида в Bitrix24: " . $responseData['lead_id'], 'success', $isCli);
    }
    if (isset($responseData['message'])) {
        printResult("Сообщение: " . $responseData['message'], 'success', $isCli);
    }
    exit(0);
} else {
    printResult("❌ ОШИБКА при отправке формы", 'error', $isCli);
    if (isset($responseData['error'])) {
        printResult("Ошибка: " . $responseData['error'], 'error', $isCli);
    }
    if (isset($responseData['error_code'])) {
        printResult("Код ошибки: " . $responseData['error_code'], 'error', $isCli);
        
        // Специальная обработка ошибок конфигурации
        if ($responseData['error_code'] === 'CONFIG_ERROR') {
            printResult("Проблема с конфигурацией .env файла", 'warning', $isCli);
            printResult("Проверьте путь: $envFile", 'info', $isCli);
        }
    }
    
    // Специальная обработка rate limiting
    if ($httpCode === 429) {
        printResult("Превышен лимит запросов (rate limiting)", 'warning', $isCli);
        if (isset($responseData['error'])) {
            printResult("Сообщение: " . $responseData['error'], 'warning', $isCli);
        }
        printResult("Подождите 1 минуту и попробуйте снова", 'info', $isCli);
    }
    
    exit(1);
}

if (!$isCli) {
    echo '</div></body></html>';
}
?>
