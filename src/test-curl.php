<?php
/**
 * Диагностический скрипт для проверки работы curl
 * Поместите этот файл в корень сайта на хостинге
 * Откройте в браузере: https://ваш-домен.ru/test-curl.php
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Проверка curl</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h2>🔍 Проверка работы curl</h2>
    
    <?php
    if (function_exists('curl_init')) {
        echo "<p class='success'>✅ curl расширение установлено</p>";
        
        // Проверяем версию curl
        $curlVersion = curl_version();
        echo "<p><strong>Версия curl:</strong> " . $curlVersion['version'] . "</p>";
        echo "<p><strong>Поддержка SSL:</strong> " . ($curlVersion['features'] & CURL_VERSION_SSL ? "✅ Да" : "❌ Нет") . "</p>";
        
        // Тестовый запрос
        echo "<h3>Тестовый запрос к httpbin.org:</h3>";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://httpbin.org/get');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $errno = curl_errno($ch);
        curl_close($ch);
        
        if ($errno) {
            echo "<p class='error'>❌ Ошибка curl (код: $errno): $error</p>";
        } else if ($httpCode == 200) {
            echo "<p class='success'>✅ curl работает корректно (HTTP $httpCode)</p>";
            echo "<p><strong>Ответ:</strong></p>";
            echo "<pre>" . htmlspecialchars(substr($result, 0, 500)) . "...</pre>";
        } else {
            echo "<p class='error'>⚠️ HTTP код: $httpCode</p>";
            echo "<pre>" . htmlspecialchars($result) . "</pre>";
        }
        
        // Проверка подключения к Bitrix24
        echo "<h3>Проверка подключения к Bitrix24:</h3>";
        
        // Загружаем переменные окружения
        require_once __DIR__ . '/scripts/api/load-env.php';
        
        $bitrixDomain = $_ENV['BITRIX24_DOMAIN'] ?? getenv('BITRIX24_DOMAIN');
        $bitrixUserId = $_ENV['BITRIX24_REST_USER_ID'] ?? getenv('BITRIX24_REST_USER_ID') ?? '1';
        $bitrixToken = $_ENV['BITRIX24_WEBHOOK_TOKEN'] ?? getenv('BITRIX24_WEBHOOK_TOKEN');
        
        if ($bitrixDomain && $bitrixToken) {
            $testURL = "https://{$bitrixDomain}/rest/{$bitrixUserId}/{$bitrixToken}/profile.json";
            
            echo "<p><strong>Тестируем URL:</strong> $testURL</p>";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $testURL);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                echo "<p class='error'>❌ Ошибка подключения: $error</p>";
            } else {
                $data = json_decode($result, true);
                if (isset($data['result'])) {
                    echo "<p class='success'>✅ Подключение к Bitrix24 успешно!</p>";
                    echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
                } else if (isset($data['error'])) {
                    echo "<p class='error'>❌ Ошибка Bitrix24 API:</p>";
                    echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
                } else {
                    echo "<p class='error'>⚠️ Неожиданный ответ (HTTP $httpCode):</p>";
                    echo "<pre>" . htmlspecialchars(substr($result, 0, 500)) . "</pre>";
                }
            }
        } else {
            echo "<p class='error'>❌ Переменные окружения не загружены. Сначала проверьте <a href='test-env.php'>test-env.php</a></p>";
        }
        
    } else {
        echo "<p class='error'>❌ curl расширение НЕ установлено</p>";
        echo "<p><strong>Решение:</strong> Обратитесь в поддержку SpringHost для установки php-curl расширения</p>";
    }
    ?>
    
    <h3>Следующие шаги:</h3>
    <ol>
        <li>Если curl не работает - обратитесь в поддержку хостинга</li>
        <li>Если curl работает, но Bitrix24 не отвечает - проверьте токен и домен в .env</li>
        <li>После исправления откройте <a href="test-send.php">test-send.php</a> для тестовой отправки</li>
    </ol>
</body>
</html>

