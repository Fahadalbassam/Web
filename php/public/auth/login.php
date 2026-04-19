<?php
/**
 * POST JSON { "email", "password" } — sets PHP session (admin_id, admin_email). No Node/JWT.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

gp_session_start();
$data = gp_read_json_body();
$email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($email === '' || $password === '') {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

$col = gp_mongo_database()->selectCollection('admins');
$admin = $col->findOne(['email' => $email]);
if ($admin === null) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}
$admin = gp_normalize_doc($admin);
if ((string) ($admin['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}
$hash = (string) ($admin['passwordHash'] ?? '');
if ($hash === '' || !password_verify($password, $hash)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

$aid = gp_oid_string($admin);
if ($aid === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}

session_regenerate_id(true);
$_SESSION['admin_id'] = $aid;
$_SESSION['admin_email'] = $email;
gp_set_checkout_customer_session($aid, $email);

echo json_encode(['ok' => true]);
