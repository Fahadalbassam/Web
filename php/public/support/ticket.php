<?php
/**
 * POST JSON — create a support ticket (public). Optional userId when session has a logged-in user.
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
$name = trim((string) ($data['name'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$subject = trim((string) ($data['subject'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and valid email are required']);
    exit;
}
if ($subject === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Subject and message are required']);
    exit;
}

gp_session_start();
$userId = null;
if (!empty($_SESSION['gp_user_id'])) {
    $userId = (string) $_SESSION['gp_user_id'];
}

$now = new \MongoDB\BSON\UTCDateTime();
$doc = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'status' => 'open',
    'createdAt' => $now,
    'updatedAt' => $now,
];
if ($userId !== null) {
    $doc['userId'] = $userId;
}

try {
    $col = gp_mongo_database()->selectCollection('supportTickets');
    $res = $col->insertOne($doc);
    echo json_encode(['ok' => true, 'id' => (string) $res->getInsertedId()]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not save ticket']);
}
