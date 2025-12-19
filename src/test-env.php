<?php
/**
 * Диагностический скрипт для проверки путей к .env файлу
 * Поместите этот файл в корень сайта на хостинге
 * Откройте в браузере: https://ваш-домен.ru/test-env.php
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Диагностика путей к .env</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        ul { list-style: none; padding-left: 0; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <h2>🔍 Диагностика путей к .env файлу</h2>
    
    <h3>Информация о сервере:</h3>
    <ul>
        <li><strong>Текущая директория скрипта:</strong> <?php echo __DIR__; ?></li>
        <li><strong>Корень документа (DOCUMENT_ROOT):</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'не определен'; ?></li>
        <li><strong>Путь к скрипту:</strong> <?php echo $_SERVER['SCRIPT_FILENAME'] ?? 'не определен'; ?></li>
        <li><strong>PHP версия:</strong> <?php echo PHP_VERSION; ?></li>
    </ul>
    
    <h3>Проверка путей к .env файлу:</h3>
    <ul>
        <?php
        $possiblePaths = [
            __DIR__ . '/.env' => 'Корень сайта (где находится этот файл)',
            $_SERVER['DOCUMENT_ROOT'] . '/.env' => 'DOCUMENT_ROOT/.env',
            dirname(__DIR__) . '/.env' => 'Родительская директория',
            dirname(dirname(__DIR__)) . '/.env' => 'На 2 уровня выше',
        ];
        
        $foundPath = null;
        foreach ($possiblePaths as $path => $description) {
            $exists = file_exists($path);
            $readable = $exists ? (is_readable($path) ? true : false) : false;
            
            echo "<li>";
            if ($exists && $readable) {
                echo "<span class='success'>✅</span> ";
                $foundPath = $path;
            } else if ($exists && !$readable) {
                echo "<span class='error'>⚠️</span> ";
            } else {
                echo "<span class='error'>❌</span> ";
            }
            echo "<strong>$path</strong><br>";
            echo "<small>$description</small>";
            if ($exists && $readable) {
                echo " <span class='success'>(найден и читаемый)</span>";
            } else if ($exists) {
                echo " <span class='error'>(найден, но не читаемый - проверьте права доступа)</span>";
            }
            echo "</li>";
        }
        ?>
    </ul>
    
    <h3>Попытка загрузки .env:</h3>
    <?php
    if ($foundPath) {
        echo "<p class='success'>✅ Файл найден: $foundPath</p>";
        
        // Пробуем загрузить
        try {
            require_once __DIR__ . '/scripts/api/load-env.php';
            echo "<p class='success'>✅ Скрипт load-env.php выполнен</p>";
        } catch (Exception $e) {
            echo "<p class='error'>❌ Ошибка при выполнении load-env.php: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p class='error'>❌ Файл .env не найден ни по одному из путей</p>";
        echo "<p><strong>Рекомендация:</strong> Загрузите файл .env в корень сайта (где находится index.html)</p>";
    }
    ?>
    
    <h3>Проверка переменных окружения:</h3>
    <ul>
        <li><strong>BITRIX24_DOMAIN:</strong> 
            <?php 
            $domain = $_ENV['BITRIX24_DOMAIN'] ?? getenv('BITRIX24_DOMAIN');
            echo $domain ? "<span class='success'>✅ $domain</span>" : "<span class='error'>❌ не установлен</span>";
            ?>
        </li>
        <li><strong>BITRIX24_REST_USER_ID:</strong> 
            <?php 
            $userId = $_ENV['BITRIX24_REST_USER_ID'] ?? getenv('BITRIX24_REST_USER_ID') ?? '1';
            echo "<span class='success'>✅ $userId</span>";
            ?>
        </li>
        <li><strong>BITRIX24_WEBHOOK_TOKEN:</strong> 
            <?php 
            $token = $_ENV['BITRIX24_WEBHOOK_TOKEN'] ?? getenv('BITRIX24_WEBHOOK_TOKEN');
            echo $token ? "<span class='success'>✅ установлен (длина: " . strlen($token) . " символов)</span>" : "<span class='error'>❌ не установлен</span>";
            ?>
        </li>
    </ul>
    
    <h3>Следующие шаги:</h3>
    <ol>
        <li>Если .env не найден - загрузите его в корень сайта</li>
        <li>Если переменные не загружены - проверьте содержимое .env файла</li>
        <li>Проверьте права доступа к .env файлу (должен быть 644 или 755)</li>
        <li>После исправления откройте <a href="test-curl.php">test-curl.php</a> для проверки curl</li>
    </ol>
</body>
</html>

