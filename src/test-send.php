<?php
/**
 * Тестовый скрипт для проверки отправки формы в Bitrix24
 * Поместите этот файл в корень сайта на хостинге
 * Откройте в браузере: https://ваш-домен.ru/test-send.php
 * 
 * ВНИМАНИЕ: Этот скрипт создаст тестовый лид в Bitrix24!
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Тест отправки формы</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    </style>
</head>
<body>
    <h2>🧪 Тест отправки формы в Bitrix24</h2>
    
    <div class="warning">
        <strong>⚠️ Внимание!</strong> Этот скрипт создаст тестовый лид в вашем Bitrix24.
    </div>
    
    <?php
    // Симулируем POST данные
    $_POST = [
        'NAME' => 'Тестовый пользователь',
        'PHONE' => '+7 (999) 123-45-67',
        'COMMENTS' => 'Тестовая заявка из test-send.php',
        'form_source' => 'Тест отправки',
        'property_type' => 'apartment'
    ];
    
    echo "<h3>Тестовые данные:</h3>";
    echo "<pre>";
    echo "Имя: " . $_POST['NAME'] . "\n";
    echo "Телефон: " . $_POST['PHONE'] . "\n";
    echo "Комментарий: " . $_POST['COMMENTS'] . "\n";
    echo "Источник: " . $_POST['form_source'] . "\n";
    echo "</pre>";
    
    echo "<h3>Выполнение скрипта send.php:</h3>";
    
    // Захватываем вывод
    ob_start();
    
    try {
        require_once __DIR__ . '/scripts/api/send.php';
        $output = ob_get_clean();
        
        echo "<p class='success'>✅ Скрипт выполнен</p>";
        
        // Пытаемся декодировать JSON ответ
        $json = json_decode($output, true);
        if ($json) {
            if (isset($json['success']) && $json['success']) {
                echo "<p class='success'>✅ <strong>Успешно!</strong> Лид создан в Bitrix24</p>";
                echo "<p><strong>ID лида:</strong> " . ($json['lead_id'] ?? 'не указан') . "</p>";
                echo "<p><strong>Сообщение:</strong> " . ($json['message'] ?? '') . "</p>";
            } else {
                echo "<p class='error'>❌ <strong>Ошибка:</strong></p>";
                echo "<pre>" . htmlspecialchars(json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
            }
        } else {
            echo "<p class='error'>⚠️ Скрипт вернул не JSON ответ:</p>";
            echo "<pre>" . htmlspecialchars($output) . "</pre>";
        }
        
    } catch (Exception $e) {
        ob_end_clean();
        echo "<p class='error'>❌ <strong>Исключение:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    } catch (Error $e) {
        ob_end_clean();
        echo "<p class='error'>❌ <strong>Фатальная ошибка:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
    ?>
    
    <h3>Что делать дальше:</h3>
    <ol>
        <li>Если тест успешен - проверьте Bitrix24 на наличие нового лида</li>
        <li>Если есть ошибки - проверьте логи на хостинге</li>
        <li>Удалите этот файл после проверки (test-send.php) из соображений безопасности</li>
    </ol>
    
    <p><a href="test-env.php">← Вернуться к проверке .env</a> | <a href="test-curl.php">Проверить curl →</a></p>
</body>
</html>

