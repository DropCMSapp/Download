<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path !== '/' && file_exists(__DIR__ . $path) && is_file(__DIR__ . $path)) {
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    if ($ext === 'php') { require __DIR__ . $path; return; }
    return false;
}
require __DIR__ . '/index.php';
