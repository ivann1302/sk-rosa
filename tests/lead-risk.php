<?php
define('SK_ROSA_INTERNAL_API', true);
require_once __DIR__ . '/../src/scripts/api/lead-risk.php';

function assertRiskScore($expected, $signals, $name) {
    $actual = calculateLeadRisk($signals)['score'];
    if ($actual !== $expected) {
        fwrite(STDERR, $name . ': expected ' . $expected . ', got ' . $actual . PHP_EOL);
        exit(1);
    }
}

assertRiskScore(100, [
    'is_staff' => true,
], 'сотрудник');

assertRiskScore(55, [
    'has_js_context' => true,
    'has_session_context' => true,
    'time_to_lead_seconds' => 6,
    'page_count' => 1,
    'is_direct' => true,
    'has_client_id' => false,
], 'быстрая прямая заявка');

assertRiskScore(0, [
    'has_js_context' => true,
    'has_session_context' => true,
    'time_to_lead_seconds' => 120,
    'page_count' => 3,
    'is_direct' => false,
    'has_client_id' => true,
    'has_click_id' => true,
    'has_attribution' => true,
], 'вовлечённый рекламный визит');

assertRiskScore(70, [
    'has_js_context' => false,
    'has_session_context' => false,
    'is_direct' => true,
    'has_client_id' => false,
    'landing_page' => '/privacy',
], 'подозрительный визит без JS');

assertRiskScore(30, [
    'has_js_context' => true,
    'has_session_context' => true,
    'time_to_lead_seconds' => 60,
    'page_count' => 2,
    'is_direct' => true,
    'has_client_id' => true,
    'landing_page' => '/',
], 'первый вход с главной');

echo "lead-risk: 5 scenarios passed\n";
