<?php
/**
 * POST JSON { "email", "password" } — creates a row in `users` (role user). password_hash via PHP.
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
$email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email required']);
    exit;
}
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
}

$db = gp_mongo_database();
$users = $db->selectCollection('users');
$admins = $db->selectCollection('admins');

if ($users->findOne(['email' => $email]) !== null || $admins->findOne(['email' => $email]) !== null) {
    http_response_code(409);
    echo json_encode(['error' => 'An account with this email already exists']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$now = new \MongoDB\BSON\UTCDateTime();

try {
    $res = $users->insertOne([
        'email' => $email,
        'passwordHash' => $hash,
        'role' => 'user',
        'createdAt' => $now,
        'updatedAt' => $now,
    ]);
} catch (\Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Could not create account']);
    exit;
}

$id = (string) $res->getInsertedId();
gp_commit_login_session($id, $email, 'user');

echo json_encode(['ok' => true]);
