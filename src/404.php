<?php
http_response_code(404);
header("HTTP/1.1 404 Not Found");
header("Status: 404 Not Found");
?>
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Страница не найдена | ROSA</title>
    <meta
      name="description"
      content="Страница не найдена. Перейдите на главную страницу ROSA или выберите одну из услуг."
    />
    <meta name="robots" content="noindex, nofollow" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="404 - Страница не найдена | ROSA" />
    <meta property="og:description" content="Страница не найдена на сайте ROSA." />
    <meta property="og:url" content="https://sk-rosa.ru/404" />
    <meta property="og:image" content="https://sk-rosa.ru/assets/images/common/about-hero.webp" />
    <meta property="og:image:type" content="image/webp" />
    <meta property="og:image:alt" content="ROSA - Ремонт под ключ" />
    <link rel="icon" href="/assets/icons/ui/favIcons/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/assets/icons/ui/favIcons/r-32.png" />
    <link rel="apple-touch-icon" href="/assets/icons/ui/favIcons/r-180.png" />
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, sans-serif;
      }

      body {
        margin: 0;
        background: #f4f6f5;
        color: #1f2937;
      }

      main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 32px 20px;
      }

      .error-page {
        max-width: 680px;
        text-align: center;
      }

      .error-page__logo {
        width: 140px;
        height: auto;
        margin-bottom: 28px;
      }

      h1 {
        margin: 0 0 16px;
        font-size: clamp(2rem, 7vw, 4rem);
        line-height: 1.05;
      }

      p {
        margin: 0 auto 28px;
        max-width: 560px;
        color: #59636e;
        font-size: 1.08rem;
        line-height: 1.6;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        border: 1px solid #d7e2dc;
        border-radius: 8px;
        padding: 0 16px;
        background: #fff;
        color: #1f2937;
        font-weight: 700;
        text-decoration: none;
      }

      a:first-child {
        border-color: #2f6b45;
        background: #2f6b45;
        color: #fff;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="error-page" aria-labelledby="page-title">
        <img
          class="error-page__logo"
          src="/assets/images/common/rosa-logo.png"
          alt="ROSA"
          width="140"
          height="40"
        />
        <h1 id="page-title">Страница не найдена</h1>
        <p>
          Возможно, адрес изменился. Перейдите на главную страницу, выберите услугу или откройте
          карту городов, где работает ROSA.
        </p>
        <nav aria-label="Основные разделы">
          <a href="/">На главную</a>
          <a href="/turnkey-repair">Ремонт под ключ</a>
          <a href="/plastering">Штукатурка</a>
          <a href="/floor-screed">Стяжка пола</a>
          <a href="/where-we-work">Где работаем</a>
        </nav>
      </section>
    </main>
  </body>
</html>
