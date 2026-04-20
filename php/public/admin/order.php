<?php
/**
 * GET ?id= — order detail. PATCH JSON { status } — update workflow status.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_require_admin();

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$col = gp_mongo_database()->selectCollection('orders');

if ($method === 'GET') {
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
    $doc = $col->findOne(['_id' => $oid]);
    if ($doc === null) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    $d = gp_normalize_doc($doc);
    echo json_encode(['order' => gp_order_public_array($d)]);
    exit;
}

if ($method === 'PATCH') {
    $data = gp_read_json_body();
    $id = trim((string) ($data['id'] ?? ''));
    $rawStatus = strtolower(trim((string) ($data['status'] ?? '')));
    $allowed = gp_order_status_values();
    if ($id === '' || !in_array($rawStatus, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id or status']);
        exit;
    }
    $status = $rawStatus;
    try {
        $oid = new \MongoDB\BSON\ObjectId($id);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id']);
        exit;
    }
    $now = new \MongoDB\BSON\UTCDateTime();
    $r = $col->updateOne(
        ['_id' => $oid],
        ['$set' => ['status' => $status, 'updatedAt' => $now]]
    );
    if ($r->getMatchedCount() < 1) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    echo json_encode(['ok' => true, 'status' => $status]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
