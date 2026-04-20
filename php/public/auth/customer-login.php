<?php
/**
 * POST JSON { "email", "password" } — same unified login as auth/login.php (storefront entry).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = gp_read_json_body();
$email = isset($data['email']) ? (string) $data['email'] : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

$r = gp_try_login_credentials($email, $password);
if (!$r['ok']) {
    http_response_code($r['code']);
    echo json_encode(['error' => $r['error']]);
    exit;
}

gp_commit_login_session($r['id'], $r['email'], $r['role']);

echo json_encode(['ok' => true]);
