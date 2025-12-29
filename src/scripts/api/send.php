<?php 
  // Загружаем переменные окружения из .env файла
  // Файл .env должен находиться в корне сайта (public_html/.env)
  // См. .env.example для примера структуры
  require_once __DIR__ . '/load-env.php';

  // === CSRF ЗАЩИТА ===
  // Настройки безопасности сессии (должны быть ДО session_start())
  ini_set('session.cookie_httponly', 1);
  ini_set('session.use_only_cookies', 1);
  ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
  
  session_start();

  // === RATE LIMITING ===
  // Простая защита от частых запросов: максимум 5 запросов в минуту
  // Проверяем только для POST запросов (основной метод для отправки форм)
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $rateLimitMax = 5; // максимум запросов
      $rateLimitWindow = 60; // окно в секундах (1 минута)

      // Инициализируем или получаем данные о запросах из сессии
      if (!isset($_SESSION['rate_limit'])) {
          $_SESSION['rate_limit'] = [
              'count' => 0,
              'reset_time' => time() + $rateLimitWindow
          ];
      }

      $now = time();
      $rateLimit = &$_SESSION['rate_limit'];

      // Если окно истекло - сбрасываем счетчик
      if ($now >= $rateLimit['reset_time']) {
          $rateLimit['count'] = 0;
          $rateLimit['reset_time'] = $now + $rateLimitWindow;
      }

      // Проверяем лимит
      $rateLimit['count']++;
      if ($rateLimit['count'] > $rateLimitMax) {
          http_response_code(429);
          header('Content-Type: application/json; charset=utf-8');
          $retryAfter = max(1, $rateLimit['reset_time'] - $now);
          header('Retry-After: ' . $retryAfter);
          die(json_encode([
              'success' => false,
              'error' => 'Слишком много запросов. Попробуйте позже.'
          ], JSON_UNESCAPED_UNICODE));
      }
  }
  // === КОНЕЦ RATE LIMITING ===

  // Функция валидации данных
function validateInput($data) {
    $errors = [];
    
    // Валидация имени
    $name = trim($data['NAME'] ?? '');
    if (empty($name)) {
        $errors[] = 'Имя обязательно для заполнения';
    } elseif (strlen($name) < 2) {
        $errors[] = 'Имя должно содержать минимум 2 символа';
    } elseif (strlen($name) > 100) {
        $errors[] = 'Имя слишком длинное (максимум 100 символов)';
    } elseif (!preg_match('/^[а-яА-ЯёЁa-zA-Z\s\-\.]+$/u', $name)) {
        $errors[] = 'Имя содержит недопустимые символы';
    }
    
    // Валидация телефона
    $phone = $data['PHONE'] ?? '';
    $phoneDigits = preg_replace('/\D/', '', $phone);
    if (empty($phone)) {
        $errors[] = 'Телефон обязателен для заполнения';
    } elseif (strlen($phoneDigits) < 10) {
        $errors[] = 'Некорректный формат телефона';
    } elseif (strlen($phoneDigits) > 15) {
        $errors[] = 'Телефон слишком длинный';
    }
    
    // Валидация комментария (опциональное поле, но если есть - проверяем)
    $comment = trim($data['COMMENTS'] ?? '');
    if (!empty($comment) && strlen($comment) > 2000) {
        $errors[] = 'Комментарий слишком длинный (максимум 2000 символов)';
    }
    
    // Валидация дополнительных полей калькулятора
    $objectType = trim($data['object_type'] ?? '');
    if (!empty($objectType) && strlen($objectType) > 100) {
        $errors[] = 'Тип объекта слишком длинный';
    }
    
    $propertyClass = trim($data['property_class'] ?? '');
    if (!empty($propertyClass) && strlen($propertyClass) > 100) {
        $errors[] = 'Класс недвижимости слишком длинный';
    }
    
    $location = trim($data['location'] ?? '');
    if (!empty($location) && strlen($location) > 200) {
        $errors[] = 'Местоположение слишком длинное';
    }
    
    $formSource = trim($data['form_source'] ?? '');
    if (!empty($formSource) && strlen($formSource) > 100) {
        $errors[] = 'Источник формы слишком длинный';
    }
    
    return $errors;
}

  // Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'success' => false,
        'error' => 'Метод не разрешен'
    ], JSON_UNESCAPED_UNICODE));
}

  // Проверка CSRF токена
  $token = $_POST['csrf_token'] ?? '';
  if (empty($token)) {
      http_response_code(403);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode([
          'success' => false,
          'error' => 'Отсутствует CSRF токен'
      ], JSON_UNESCAPED_UNICODE));
  }

  if (empty($_SESSION['csrf_token'])) {
      http_response_code(403);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode([
          'success' => false,
          'error' => 'CSRF токен не найден в сессии'
      ], JSON_UNESCAPED_UNICODE));
  }

  // Безопасное сравнение токенов (защита от timing attacks)
  if (!hash_equals($_SESSION['csrf_token'], $token)) {
      http_response_code(403);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode([
          'success' => false,
          'error' => 'Неверный CSRF токен'
      ], JSON_UNESCAPED_UNICODE));
  }
  // === КОНЕЦ CSRF ЗАЩИТЫ ===

  // Получаем конфигурацию Bitrix24 из переменных окружения (.env)
  // Все значения должны быть указаны в файле .env
  // См. документацию: DEPLOY.md
  
  $bitrixDomain = $_ENV['BITRIX24_DOMAIN'] ?? getenv('BITRIX24_DOMAIN');
  $bitrixUserId = $_ENV['BITRIX24_REST_USER_ID'] ?? getenv('BITRIX24_REST_USER_ID') ?? '1';
  $bitrixToken = $_ENV['BITRIX24_WEBHOOK_TOKEN'] ?? getenv('BITRIX24_WEBHOOK_TOKEN');
  
  // Проверяем наличие обязательных переменных
  if (empty($bitrixDomain)) {
    error_log('Ошибка конфигурации: BITRIX24_DOMAIN не установлен в .env файле');
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'success' => false,
        'error' => 'Ошибка конфигурации сервера. Обратитесь к администратору.',
        'error_code' => 'CONFIG_ERROR'
    ], JSON_UNESCAPED_UNICODE));
  }
  
  if (empty($bitrixToken)) {
    error_log('Ошибка конфигурации: BITRIX24_WEBHOOK_TOKEN не установлен в .env файле');
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'success' => false,
        'error' => 'Ошибка конфигурации сервера. Обратитесь к администратору.',
        'error_code' => 'CONFIG_ERROR'
    ], JSON_UNESCAPED_UNICODE));
  }
  
  $queryURL = "https://{$bitrixDomain}/rest/{$bitrixUserId}/{$bitrixToken}/crm.lead.add.json";

  // Валидация входных данных ПЕРЕД обработкой
  $validationErrors = validateInput($_POST);
  if (!empty($validationErrors)) {
      http_response_code(400);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode([
          'success' => false,
          'error' => implode('. ', $validationErrors)
      ], JSON_UNESCAPED_UNICODE));
  }

  // Собираем и санитизируем данные из формы (после валидации)
	$sPhone = htmlspecialchars($_POST["PHONE"] ?? '', ENT_QUOTES, 'UTF-8');
	$sName = htmlspecialchars(trim($_POST["NAME"] ?? ''), ENT_QUOTES, 'UTF-8');
	$sComment = htmlspecialchars(trim($_POST["COMMENTS"] ?? ''), ENT_QUOTES, 'UTF-8');
	$sFormSource = htmlspecialchars(trim($_POST["form_source"] ?? 'Не указан'), ENT_QUOTES, 'UTF-8');
	
	// Дополнительные поля для калькулятора
	$sObjectType = htmlspecialchars(trim($_POST["object_type"] ?? ''), ENT_QUOTES, 'UTF-8');
	$sPropertyClass = htmlspecialchars(trim($_POST["property_class"] ?? ''), ENT_QUOTES, 'UTF-8');
	$sLocation = htmlspecialchars(trim($_POST["location"] ?? ''), ENT_QUOTES, 'UTF-8');
	
	// Способ связи (валидация значения из белого списка)
	$types = [
		"apartment" => "WhatsApp",
		"office" => "Telegram", 
		"house" => "Позвонить"
	];
	$propertyType = $_POST["property_type"] ?? '';
	$sCommType = isset($types[$propertyType]) ? $types[$propertyType] : "Не указан";
	
	$arPhone = (!empty($sPhone)) ? array(array('VALUE' => $sPhone, 'VALUE_TYPE' => 'MOBILE')) : array();
	
	// Формируем расширенный комментарий
	$extendedComment = "Способ связи: $sCommType\n";
	$extendedComment .= "Источник: $sFormSource\n";
	$extendedComment .= "Комментарий: $sComment";
	
	// Добавляем информацию из калькулятора если есть
	if (!empty($sObjectType)) {
		$extendedComment .= "\nТип объекта: $sObjectType";
	}
	if (!empty($sPropertyClass)) {
		$extendedComment .= "\nКласс недвижимости: $sPropertyClass";
	}
	if (!empty($sLocation)) {
		$extendedComment .= "\nМестоположение: $sLocation";
	}
	
	// формируем параметры для создания лида	
	$queryData = http_build_query(array(
		"fields" => array(
			"TITLE"    => "Новая заявка с сайта - $sFormSource",
			"NAME" => $sName,	// имя
			"PHONE" => $arPhone, // телефон
			"COMMENTS" => $extendedComment
		),
		'params' => array("REGISTER_SONET_EVENT" => "Y")	// Y = произвести регистрацию события добавления лида в живой ленте. Дополнительно будет отправлено уведомление ответственному за лиду.	
	));

	// отправляем запрос в Б24 и обрабатываем ответ
	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_SSL_VERIFYPEER => true,
		CURLOPT_SSL_VERIFYHOST => 2,
		CURLOPT_POST => 1,
		CURLOPT_HEADER => 0,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $queryURL,
		CURLOPT_POSTFIELDS => $queryData,
	));
	$result = curl_exec($curl);
	curl_close($curl);
	$result = json_decode($result,1); 

	// Проверяем результат и возвращаем ответ
header('Content-Type: application/json; charset=utf-8');

if (isset($result['result'])) {
    // Успешное создание лида
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'lead_id' => $result['result'],
        'message' => 'Заявка успешно отправлена'
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Ошибка
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $result['error_description'] ?? 'Неизвестная ошибка',
        'error_code' => $result['error'] ?? 'UNKNOWN'
    ], JSON_UNESCAPED_UNICODE);
    
    // Логируем ошибку
    error_log('Bitrix24 Error: ' . json_encode($result, JSON_UNESCAPED_UNICODE));
}
?>