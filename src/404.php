<?php
http_response_code(404);
header("HTTP/1.1 404 Not Found");
header("Status: 404 Not Found");
readfile(__DIR__ . "/404.html");
exit;
