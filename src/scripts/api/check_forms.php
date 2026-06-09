<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

// Скрипт для проверки стандартизации форм
echo "=== ПРОВЕРКА СТАНДАРТИЗАЦИИ ФОРМ ===\n\n";

// Список всех HTML файлов с формами
// Пути относительно корня src/
$htmlFiles = [
    '../index.html' => 'Главная страница',
    '../calculator.html' => 'Калькулятор',
    '../turnkey-repair.html' => 'Ремонт под ключ',
    '../airless-painting.html' => 'Безвоздушная покраска',
    '../floor-screed.html' => 'Стяжка пола',
    '../plastering.html' => 'Штукатурные работы'
];

// Обязательные поля для всех форм
$requiredFields = ['NAME', 'PHONE', 'COMMENTS', 'property_type', 'form_source'];

// Дополнительные поля для калькулятора
$calculatorFields = ['object_type', 'property_class', 'location'];

foreach ($htmlFiles as $file => $description) {
    echo "📄 $description ($file):\n";
    
    if (!file_exists($file)) {
        echo "   ❌ Файл не найден\n\n";
        continue;
    }
    
    $content = file_get_contents($file);
    
    // Проверяем обязательные поля
    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (strpos($content, 'name="' . $field . '"') === false) {
            $missingFields[] = $field;
        }
    }
    
    if (empty($missingFields)) {
        echo "   ✅ Все обязательные поля присутствуют\n";
    } else {
        echo "   ❌ Отсутствуют поля: " . implode(', ', $missingFields) . "\n";
    }
    
    // Проверяем дополнительные поля для калькулятора
    if ($description === 'Калькулятор') {
        $missingCalcFields = [];
        foreach ($calculatorFields as $field) {
            if (strpos($content, 'name="' . $field . '"') === false) {
                $missingCalcFields[] = $field;
            }
        }
        
        if (empty($missingCalcFields)) {
            echo "   ✅ Все поля калькулятора присутствуют\n";
        } else {
            echo "   ⚠️  Отсутствуют поля калькулятора: " . implode(', ', $missingCalcFields) . "\n";
        }
    }
    
    // Проверяем action и method
    // Проверяем оба варианта: для index.html (scripts/api/send.php) и для других страниц (../scripts/api/send.php)
    if (strpos($content, 'action="scripts/api/send.php"') !== false || 
        strpos($content, 'action="../scripts/api/send.php"') !== false) {
        echo "   ✅ Action указан правильно\n";
    } else {
        echo "   ❌ Action не указан или указан неправильно\n";
    }
    
    if (strpos($content, 'method="POST"') !== false) {
        echo "   ✅ Method указан правильно\n";
    } else {
        echo "   ❌ Method не указан или указан неправильно\n";
    }
    
    echo "\n";
}

echo "=== ПРОВЕРКА ЗАВЕРШЕНА ===\n";
echo "\nРекомендации:\n";
echo "1. Убедитесь, что все формы имеют action='scripts/api/send.php' (для index.html) или action='../scripts/api/send.php' (для других страниц)\n";
echo "2. Убедитесь, что все формы имеют method='POST'\n";
echo "3. Проверьте, что все обязательные поля присутствуют\n";
echo "4. Для калькулятора проверьте дополнительные поля\n";
?>
