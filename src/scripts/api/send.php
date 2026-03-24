<?php
  require_once __DIR__ . '/load-env.php';

  error_log('[SEND] Запрос получен: ' . $_SERVER['REQUEST_METHOD'] . ' от ' . ($_SERVER['REMOTE_ADDR'] ?? '?'));

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode(['success' => false, 'error' => 'Метод не разрешен'], JSON_UNESCAPED_UNICODE));
  }

  error_log('[SEND] POST данные: NAME=' . ($_POST['NAME'] ?? 'ПУСТО') . ' PHONE=' . ($_POST['PHONE'] ?? 'ПУСТО'));

  $sPhone      = htmlspecialchars(trim($_POST['PHONE']       ?? ''), ENT_QUOTES, 'UTF-8');
  $sName       = htmlspecialchars(trim($_POST['NAME']        ?? ''), ENT_QUOTES, 'UTF-8');
  $sComment    = htmlspecialchars(trim($_POST['COMMENTS']    ?? ''), ENT_QUOTES, 'UTF-8');
  $sFormSource = htmlspecialchars(trim($_POST['form_source'] ?? 'Не указан'), ENT_QUOTES, 'UTF-8');

  // UTM-метки, переданные из sessionStorage через JS
  $sUtmSource   = htmlspecialchars(trim($_POST['utm_source']   ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmMedium   = htmlspecialchars(trim($_POST['utm_medium']   ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmCampaign = htmlspecialchars(trim($_POST['utm_campaign'] ?? ''), ENT_QUOTES, 'UTF-8');
  $sUtmTerm     = htmlspecialchars(trim($_POST['utm_term']     ?? ''), ENT_QUOTES, 'UTF-8');
  $sReferrer    = htmlspecialchars(trim($_POST['referrer']     ?? ''), ENT_QUOTES, 'UTF-8');

  if (empty($sName) || empty($sPhone)) {
      error_log('[SEND] Ошибка валидации: имя или телефон пусты');
      http_response_code(400);
      header('Content-Type: application/json; charset=utf-8');
      die(json_encode(['success' => false, 'error' => 'Заполните имя и телефон'], JSON_UNESCAPED_UNICODE));
  }

  $telegramToken   = $_ENV['TELEGRAM_BOT_TOKEN']  ?? getenv('TELEGRAM_BOT_TOKEN')  ?: '8400675649:AAFNYG8Q8hvHtcy1dlGeteS4c5fgLOOhYRc';
  $telegramChatId  = $_ENV['TELEGRAM_CHAT_ID']    ?? getenv('TELEGRAM_CHAT_ID')    ?: '711139656';
  $telegramChatId2 = $_ENV['TELEGRAM_CHAT_ID_2']  ?? getenv('TELEGRAM_CHAT_ID_2')  ?: '473152112';

  error_log('[SEND] Telegram token: ' . (empty($telegramToken) ? 'ПУСТО' : substr($telegramToken, 0, 15) . '...'));
  error_log('[SEND] Chat IDs: ' . $telegramChatId . ', ' . $telegramChatId2);

  if (!empty($telegramToken) && !empty($telegramChatId)) {
      $moscow     = new DateTimeZone('Europe/Moscow');
      $moscowTime = (new DateTime('now', $moscow))->format('d.m.Y H:i');

      $tgLines = [
          '🔔 <b>Новая заявка с сайта!</b>',
          '',
          '👤 Имя: <b>' . $sName . '</b>',
          '📞 Телефон: <b>' . $sPhone . '</b>',
      ];
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

      $chatIds = array_filter([$telegramChatId, $telegramChatId2]);
      foreach ($chatIds as $chatId) {
          error_log('[SEND] Отправка в Telegram chat_id=' . $chatId);
          $tgCurl = curl_init('https://api.telegram.org/bot' . $telegramToken . '/sendMessage');
          curl_setopt_array($tgCurl, [
              CURLOPT_POST           => true,
              CURLOPT_RETURNTRANSFER => true,
              CURLOPT_TIMEOUT        => 5,
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
              error_log('[SEND] CURL ОШИБКА для ' . $chatId . ': ' . $tgError);
          } else {
              $tgData = json_decode($tgResponse, true);
              if ($tgData['ok'] ?? false) {
                  error_log('[SEND] ✅ Telegram OK, message_id=' . $tgData['result']['message_id']);
              } else {
                  error_log('[SEND] ❌ Telegram ОШИБКА: ' . ($tgData['description'] ?? $tgResponse));
              }
          }
      }
  }

  error_log('[SEND] Ответ клиенту: success=true');
  header('Content-Type: application/json; charset=utf-8');
  http_response_code(200);
  echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена'], JSON_UNESCAPED_UNICODE);
?>
