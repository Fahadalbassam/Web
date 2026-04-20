<?php
/**
 * GET ?q= — list support tickets (newest first). PATCH JSON { id, status } — update status.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_require_admin();

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$col = gp_mongo_database()->selectCollection('supportTickets');

if ($method === 'GET') {
    $q = trim((string) ($_GET['q'] ?? ''));
    $filter = [];
    if ($q !== '') {
        $rx = ['$regex' => preg_quote($q, '/'), '$options' => 'i'];
        $filter['$or'] = [
            ['name' => $rx],
            ['email' => $rx],
            ['subject' => $rx],
            ['message' => $rx],
        ];
    }
    $cursor = $col->find($filter, ['sort' => ['createdAt' => -1]]);
    $out = [];
    foreach ($cursor as $doc) {
        $d = gp_normalize_doc($doc);
        $out[] = [
            'id' => gp_oid_string($d) ?? '',
            'name' => (string) ($d['name'] ?? ''),
            'email' => (string) ($d['email'] ?? ''),
            'subject' => (string) ($d['subject'] ?? ''),
            'message' => (string) ($d['message'] ?? ''),
            'status' => (string) ($d['status'] ?? 'open'),
            'userId' => isset($d['userId']) ? (string) $d['userId'] : null,
            'createdAt' => gp_iso_datetime($d['createdAt'] ?? null),
            'updatedAt' => gp_iso_datetime($d['updatedAt'] ?? null),
        ];
    }
    echo json_encode(['tickets' => $out]);
    exit;
}

if ($method === 'PATCH') {
    $data = gp_read_json_body();
    $id = trim((string) ($data['id'] ?? ''));
    $status = trim((string) ($data['status'] ?? ''));
    $allowed = ['open', 'in_progress', 'closed'];
    if ($id === '' || !in_array($status, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id or status']);
        exit;
    }
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
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
