<?php
header('Content-Type: application/json');
$counterFile = __DIR__ . '/melody_counter.txt';

// Zorg dat het bestand bestaat
if (!file_exists($counterFile)) {
    file_put_contents($counterFile, '0');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
} else {
    $content = @file_get_contents($counterFile);
    $count = ($content === false || trim($content) === '') ? 0 : (int)$content;
    echo json_encode(['count' => $count]);
    exit;
}
