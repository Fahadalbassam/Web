<?php
/**
 * POST multipart field "file" — saves under /uploads (served by PHP public root).
 * Course: image stored as path/filename in Mongo; binary lands on disk here.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_require_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing file']);
    exit;
}

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload failed']);
    exit;
}

$tmp = (string) ($file['tmp_name'] ?? '');
if ($tmp === '' || !is_uploaded_file($tmp)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid upload']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($tmp) ?: '';
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];
if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode(['error' => 'Only JPEG, PNG, WebP, or GIF images are allowed']);
    exit;
}

$ext = $allowed[$mime];
$maxBytes = 5 * 1024 * 1024;
$size = (int) ($file['size'] ?? 0);
if ($size <= 0 || $size > $maxBytes) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit;
}

$destDir = dirname(__DIR__) . '/uploads';
if (!is_dir($destDir) && !mkdir($destDir, 0755, true) && !is_dir($destDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not create uploads directory']);
    exit;
}

$basename = bin2hex(random_bytes(16)) . '.' . $ext;
$destPath = $destDir . '/' . $basename;
if (!move_uploaded_file($tmp, $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not save file']);
    exit;
}

// Site-relative path; Next resolves via /backend rewrite for same-origin images.
echo json_encode(['path' => '/uploads/' . $basename]);
