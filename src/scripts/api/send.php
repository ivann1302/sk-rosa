<?php
  define('SK_ROSA_INTERNAL_API', true);
  require_once __DIR__ . '/load-env.php';

  function maskContactForLog($value) {
      $digits = preg_replace('/\D+/', '', (string)$value);

      if (strlen($digits) >= 4) {
          return str_repeat('*', max(0, strlen($digits) - 4)) . substr($digits, -4);
      }

      return trim((string)$value) === '' ? 'empty' : 'set';
  }

  function hashForLog($value) {
      $value = trim((string)$value);

      return $value === '' ? 'unknown' : substr(hash('sha256', $value), 0, 12);
  }

  $leadLogId = 'lead_' . gmdate('YmdHis') . '_' . bin2hex(random_bytes(3));
  error_log('[SEND] event=' . $leadLogId . ' status=request method=' . $_SERVER['REQUEST_METHOD'] . ' ip_hash=' . hashForLog($_SERVER['REMOTE_ADDR'] ?? ''));

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode(['success' => false, 'error' => 'Метод не разрешен'], JSON_UNESCAPED_UNICODE));
  }

  $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';
  $requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
  $expectsJson = stripos($acceptHeader, 'application/json') !== false
      || strcasecmp($requestedWith, 'XMLHttpRequest') === 0;

  $honeypotValue = trim($_POST['company_website'] ?? '');
  if ($honeypotValue !== '') {
      error_log('[SEND] event=' . $leadLogId . ' status=bot_filtered filter=honeypot');
      if (!$expectsJson) {
          header('Location: /thank-you', true, 303);
          exit;
      }

      header('Content-Type: application/json; charset=utf-8');
      http_response_code(200);
      echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена'], JSON_UNESCAPED_UNICODE);
      exit;
  }

  error_log('[SEND] event=' . $leadLogId . ' status=payload name_set=' . (empty($_POST['NAME']) ? 'no' : 'yes') . ' contact_mask=' . maskContactForLog($_POST['PHONE'] ?? $_POST['CONTACT_VALUE'] ?? '') . ' source_hash=' . hashForLog($_POST['form_source'] ?? ''));

  $sPhone      = htmlspecialchars(trim($_POST['PHONE']       ?? ''), ENT_QUOTES, 'UTF-8');
  $sName       = htmlspecialchars(trim($_POST['NAME']        ?? ''), ENT_QUOTES, 'UTF-8');
  $sComment    = htmlspecialchars(trim($_POST['COMMENTS']    ?? ''), ENT_QUOTES, 'UTF-8');
  $sFormSource = htmlspecialchars(trim($_POST['form_source'] ?? 'Не указан'), ENT_QUOTES, 'UTF-8');
  $sMessenger  = htmlspecialchars(trim($_POST['MESSENGER']   ?? ''), ENT_QUOTES, 'UTF-8');
  $sContactMethod = htmlspecialchars(trim($_POST['CONTACT_METHOD'] ?? ''), ENT_QUOTES, 'UTF-8');
  $sContactValue  = htmlspecialchars(trim($_POST['CONTACT_VALUE']  ?? ''), ENT_QUOTES, 'UTF-8');

  if (empty($sMessenger) && !empty($sContactMethod)) {
      $sMessenger = $sContactMethod;
  }

  // UTM-метки, переданные из sessionStorage через JS
  $sUtmSource   = htmlspecialchars(trim($_POST['utm_source']   ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmMedium   = htmlspecialchars(trim($_POST['utm_medium']   ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmCampaign = htmlspecialchars(trim($_POST['utm_campaign'] ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmTerm     = htmlspecialchars(trim($_POST['utm_term']     ?? ''), ENT_QUOTES, 'UTF-8');
  $sReferrer    = htmlspecialchars(trim($_POST['referrer']     ?? ''), ENT_QUOTES, 'UTF-8');

  if (empty($sPhone) && empty($sContactValue)) {
      error_log('[SEND] event=' . $leadLogId . ' status=validation_failed reason=empty_contact');
      http_response_code(400);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode(['success' => false, 'error' => 'Заполните контакт для связи'], JSON_UNESCAPED_UNICODE));
  }

  $telegramToken   = $_ENV['TELEGRAM_BOT_TOKEN']  ?? getenv('TELEGRAM_BOT_TOKEN')  ?: '';
  $telegramChatId  = $_ENV['TELEGRAM_CHAT_ID']    ?? getenv('TELEGRAM_CHAT_ID')    ?: '';
  $telegramChatId2 = $_ENV['TELEGRAM_CHAT_ID_2']  ?? getenv('TELEGRAM_CHAT_ID_2')  ?: '';
  $telegramChatId3 = $_ENV['TELEGRAM_CHAT_ID_3']  ?? getenv('TELEGRAM_CHAT_ID_3')  ?: '';

  if (empty($telegramToken) || empty($telegramChatId)) {
      error_log('[SEND] event=' . $leadLogId . ' status=config_error service=telegram token_configured=' . (empty($telegramToken) ? 'no' : 'yes') . ' primary_recipient_configured=' . (empty($telegramChatId) ? 'no' : 'yes'));
      header('Content-Type: application/json; charset=utf-8');
      http_response_code(500);
      echo json_encode(['success' => false, 'error' => 'Сервис отправки заявок временно недоступен. Позвоните нам или напишите в мессенджер.'], JSON_UNESCAPED_UNICODE);
      exit;
  }

  $telegramConfigured = true;
  $telegramDelivered = false;

  if ($telegramConfigured) {
      $moscow     = new DateTimeZone('Europe/Moscow');
      $moscowTime = (new DateTime('now', $moscow))->format('d.m.Y H:i');

      $tgLines = [
          '🔔 <b>Новая заявка с сайта!</b>',
          '',
      ];
      if (!empty($sName)) {
          $tgLines[] = '👤 Имя: <b>' . $sName . '</b>';
      }
      if (!empty($sPhone)) {
          $tgLines[] = '📞 Телефон: <b>' . $sPhone . '</b>';
      }
      if (!empty($sMessenger)) {
          $tgLines[] = '📲 Где получить расчёт: <b>' . $sMessenger . '</b>';
      }
      if (!empty($sContactValue) && $sContactValue !== $sPhone) {
          $tgLines[] = '💬 Контакт для расчёта: <b>' . $sContactValue . '</b>';
      }
      if (!empty($sComment)) {
          $tgLines[] = '💬 Комментарий: ' . $sComment;
      }
      if (!empty($sFormSource)) {
          $tgLines[] = '📍 Услуга: ' . $sFormSource;
      }

      // Блок источника трафика — собираем только непустые данные
      if (!empty($sUtmSource)) {
          $utmLine = '📊 Источник: ' . $sUtmSource;
          if (!empty($sUtmMedium))   { $utmLine .= ' / ' . $sUtmMedium; }
          if (!empty($sUtmCampaign)) { $utmLine .= ' / ' . $sUtmCampaign; }
          $tgLines[] = $utmLine;
          if (!empty($sUtmTerm)) {
              $tgLines[] = '🔑 Ключ: ' . $sUtmTerm;
          }
      } elseif (!empty($sReferrer)) {
          // Нет UTM, но есть реферер — значит органика или переход с другого сайта
          $referrerHost = parse_url($sReferrer, PHP_URL_HOST) ?: $sReferrer;
          $tgLines[] = '📊 Источник: ' . $referrerHost . ' (без UTM)';
      } else {
          $tgLines[] = '📊 Источник: прямой заход';
      }

      $pageUrl = $_SERVER['HTTP_REFERER'] ?? '';
      if (!empty($pageUrl)) {
          $tgLines[] = '🌐 Страница: ' . $pageUrl;
      }
      $tgLines[]  = '🕐 Время: ' . $moscowTime;
      $tgMessage  = implode("\n", $tgLines);

      $chatIds = array_filter([$telegramChatId, $telegramChatId2, $telegramChatId3]);
      foreach ($chatIds as $recipientIndex => $chatId) {
          error_log('[SEND] event=' . $leadLogId . ' status=telegram_send_attempt recipient_index=' . ($recipientIndex + 1));
          $requestTimeout = $telegramDelivered ? 5 : 15;
          $connectTimeout = $telegramDelivered ? 4 : 8;
          $tgCurl = curl_init('https://api.telegram.org/bot' . $telegramToken . '/sendMessage');
          curl_setopt_array($tgCurl, [
              CURLOPT_POST           => true,
              CURLOPT_RETURNTRANSFER => true,
              CURLOPT_CONNECTTIMEOUT => $connectTimeout,
              CURLOPT_TIMEOUT        => $requestTimeout,
              CURLOPT_POSTFIELDS     => http_build_query([
                  'chat_id'    => $chatId,
                  'text'       => $tgMessage,
                  'parse_mode' => 'HTML',
              ]),
          ]);
          $tgResponse = curl_exec($tgCurl);
          $tgError    = curl_error($tgCurl);
          curl_close($tgCurl);

          if (!empty($tgError)) {
              error_log('[SEND] event=' . $leadLogId . ' status=telegram_curl_error recipient_index=' . ($recipientIndex + 1) . ' error_hash=' . hashForLog($tgError));
          } else {
              $tgData = json_decode($tgResponse, true);
              if ($tgData['ok'] ?? false) {
                  $telegramDelivered = true;
                  error_log('[SEND] event=' . $leadLogId . ' status=telegram_delivered recipient_index=' . ($recipientIndex + 1));
              } else {
                  error_log('[SEND] event=' . $leadLogId . ' status=telegram_api_error recipient_index=' . ($recipientIndex + 1) . ' error_hash=' . hashForLog($tgData['description'] ?? $tgResponse));
              }
          }
      }
  }

  if ($telegramConfigured && !$telegramDelivered) {
      error_log('[SEND] event=' . $leadLogId . ' status=failed reason=telegram_delivery_failed');
      header('Content-Type: application/json; charset=utf-8');
      http_response_code(502);
      echo json_encode(['success' => false, 'error' => 'Не удалось отправить заявку в Telegram. Попробуйте позже или позвоните нам.'], JSON_UNESCAPED_UNICODE);
      exit;
  }

  error_log('[SEND] event=' . $leadLogId . ' status=success');
  if (!$expectsJson) {
      header('Location: /thank-you', true, 303);
      exit;
  }

  header('Content-Type: application/json; charset=utf-8');
  http_response_code(200);
  echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена'], JSON_UNESCAPED_UNICODE);
?>
