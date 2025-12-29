<?php
/**
 * Endpoint для получения CSRF токена
 * Используется для защиты форм от CSRF атак
 */

// Настройки безопасности сессии (должны быть ДО session_start())
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);

session_start();

// Генерируем токен, если его еще нет или истек срок действия (опционально)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['csrf_token_time'] = time();
}

// Возвращаем токен
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

echo json_encode([
    'token' => $_SESSION['csrf_token']
], JSON_UNESCAPED_UNICODE);
?>

