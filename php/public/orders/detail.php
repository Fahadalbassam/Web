<?php
/**
 * GET ?id= — one order for the signed-in storefront user (403 if not owned).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user = gp_storefront_authenticated_user();
if ($user === null) {
    http_response_code(401);
    echo json_encode(['error' => 'Sign in required']);
    exit;
}

$id = trim((string) ($_GET['id'] ?? ''));
if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

try {
    $oid = new \MongoDB\BSON\ObjectId($id);
} catch (\Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid id']);
    exit;
}

$col = gp_mongo_database()->selectCollection('orders');
$doc = $col->findOne(['_id' => $oid]);
if ($doc === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

$d = gp_normalize_doc($doc);
if (!gp_order_user_can_view($d, $user['id'], $user['email'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

echo json_encode(['order' => gp_order_public_array($d)]);
