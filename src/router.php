<?php
// Router для встроенного PHP сервера
// Использование: php -S localhost:8000 router.php

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file_path = $_SERVER['DOCUMENT_ROOT'] . $request_uri;

// Если запрос к реальному файлу - отдаём его
if ($request_uri !== '/' && file_exists($file_path) && is_file($file_path)) {
    return false;
}

// Проверяем статические ресурсы
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|mp4|webm)$/', $request_uri)) {
    if (file_exists($file_path)) {
        return false;
    }
    http_response_code(404);
    include(__DIR__ . '/404.php');
    exit;
}

// Блог: /blog/article-name → /articles/article-name.html
if (preg_match('/^\/blog\/([^\/]+)$/', $request_uri, $matches)) {
    $article_file = __DIR__ . '/articles/' . $matches[1] . '.html';
    if (file_exists($article_file)) {
        include($article_file);
        exit;
    }
}

// /blog → /blog.html
if ($request_uri === '/blog' || $request_uri === '/blog/') {
    if (file_exists(__DIR__ . '/blog.html')) {
        include(__DIR__ . '/blog.html');
        exit;
    }
}

// Городские страницы: /service/city → /pages/service/city.html
if (preg_match('/^\/(turnkey-repair|plastering|airless-painting|floor-screed)\/([^\/]+)$/', $request_uri, $matches)) {
    $city_file = __DIR__ . '/pages/' . $matches[1] . '/' . $matches[2] . '.html';
    if (file_exists($city_file)) {
        include($city_file);
        exit;
    }
}

// Главная страница
if ($request_uri === '/' || $request_uri === '') {
    if (file_exists(__DIR__ . '/index.html')) {
        include(__DIR__ . '/index.html');
        exit;
    }
}

// Обычные страницы: /page → /page.html или /pages/page.html
$html_file = __DIR__ . $request_uri . '.html';
$pages_file = __DIR__ . '/pages' . $request_uri . '.html';

if (file_exists($html_file)) {
    include($html_file);
    exit;
} elseif (file_exists($pages_file)) {
    include($pages_file);
    exit;
}

// Если ничего не найдено - 404
http_response_code(404);
include(__DIR__ . '/404.php');
exit;
?>
