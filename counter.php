<?php
session_start();
header('Content-Type: application/json');
$counterFile = __DIR__ . '/counter.txt';
$rateLimitFile = __DIR__ . '/ratelimit_' . md5($_SERVER['REMOTE_ADDR']) . '.txt';
$rateLimitMax = 10; // max 10 POSTs per minuut
$rateLimitWindow = 60; // seconden

// CSRF-token genereren indien niet aanwezig
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Ratelimiting functie
function check_ratelimit($file, $max, $window) {
    $now = time();
    $data = @json_decode(@file_get_contents($file), true);
    if (!$data || !isset($data['times'])) {
        $data = ['times' => []];
    }
    // Oude timestamps verwijderen
    $data['times'] = array_filter($data['times'], function($t) use ($now, $window) {
        return $t > $now - $window;
    });
    if (count($data['times']) >= $max) {
        return false;
    }
    $data['times'][] = $now;
    file_put_contents($file, json_encode($data));
    return true;
}

// Zorg dat het bestand bestaat
if (!file_exists($counterFile)) {
    file_put_contents($counterFile, '0');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF-token check
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['csrf_token'] ?? $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['error' => 'CSRF token ongeldig']);
        exit;
    }
    // Ratelimiting
    if (!check_ratelimit($rateLimitFile, $rateLimitMax, $rateLimitWindow)) {
        http_response_code(429);
        echo json_encode(['error' => 'Te veel verzoeken, probeer later opnieuw.']);
        exit;
    }
    $fp = fopen($counterFile, 'c+');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            rewind($fp);
            $content = stream_get_contents($fp);
            $count = ($content === false || trim($content) === '') ? 0 : (int)$content;
            $count++;
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $count);
            fflush($fp);
            flock($fp, LOCK_UN);
        } else {
            $count = 0;
        }
        fclose($fp);
    } else {
        $count = 0;
    }
    echo json_encode(['count' => $count]);
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($counterFile);
    $count = ($content === false || trim($content) === '') ? 0 : (int)$content;
    // Geef ook het CSRF-token terug voor gebruik in de frontend
    echo json_encode(['count' => $count, 'csrf_token' => $_SESSION['csrf_token']]);
    exit;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Methode niet toegestaan']);
    exit;
}
