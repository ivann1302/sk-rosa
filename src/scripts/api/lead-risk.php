<?php
if (!defined('SK_ROSA_INTERNAL_API')) {
    http_response_code(403);
    exit;
}

function calculateLeadRisk($signals) {
    if (!empty($signals['is_staff'])) {
        return [
            'score' => 100,
            'label' => 'сотрудник',
            'emoji' => '⚠️',
            'reasons' => ['Номер совпадает со списком сотрудников: +100'],
        ];
    }

    $score = 0;
    $reasons = [];
    $add = function ($points, $reason) use (&$score, &$reasons) {
        $score += $points;
        $sign = $points > 0 ? '+' : '';
        $reasons[] = $reason . ': ' . $sign . $points;
    };

    if (empty($signals['has_js_context'])) {
        $add(25, 'JS-контекст не получен');
    }

    if (empty($signals['has_session_context'])) {
        $add(15, 'Нет истории сессии');
    } else {
        $timeToLead = max(0, (int)($signals['time_to_lead_seconds'] ?? 0));
        $pageCount = max(0, (int)($signals['page_count'] ?? 0));

        if ($timeToLead <= 10) {
            $add(20, 'Заявка быстрее 10 секунд');
        } elseif ($timeToLead <= 30) {
            $add(10, 'Заявка за 10–30 секунд');
        }

        if ($pageCount === 1) {
            $add(15, 'Просмотрена одна страница');
        }

        if ($pageCount >= 3 && $timeToLead >= 90) {
            $add(-10, 'Вовлечённый визит');
        }
    }

    if (!empty($signals['is_direct'])) {
        $add(10, 'Прямой заход');
    }

    if (empty($signals['has_client_id'])) {
        $add(10, 'Нет ClientID');
    }

    $landingPage = (string)($signals['landing_page'] ?? '');
    if (preg_match('#/(?:privacy|terms|404)(?:[./]|$)#i', $landingPage)) {
        $add(10, 'Вход с технической страницы');
    }

    if (!empty($signals['has_click_id'])) {
        $add(-20, 'Есть рекламный click ID');
    } elseif (!empty($signals['has_attribution'])) {
        $add(-10, 'Есть UTM или referrer');
    }

    $score = max(0, min(100, $score));

    if ($score >= 70) {
        $label = 'критический';
        $emoji = '🔴';
    } elseif ($score >= 50) {
        $label = 'высокий';
        $emoji = '🟠';
    } elseif ($score >= 25) {
        $label = 'требует внимания';
        $emoji = '🟡';
    } else {
        $label = 'низкий';
        $emoji = '🟢';
    }

    return [
        'score' => $score,
        'label' => $label,
        'emoji' => $emoji,
        'reasons' => $reasons,
    ];
}
