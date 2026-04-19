<?php
/**
 * GET ?id= — one product (admin).
 * PATCH body JSON — update (also pass ?id=).
 * DELETE ?id= — remove.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_require_admin();

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$data = [];
if (in_array($method, ['PATCH', 'PUT', 'POST', 'DELETE'], true)) {
    $data = gp_read_json_body();
}

$id = trim((string) ($_GET['id'] ?? ($data['id'] ?? '')));
$col = gp_mongo_database()->selectCollection('products');

if ($method === 'GET') {
    if ($id === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    $doc = gp_find_product_by_id($id);
    if ($doc === null) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    echo json_encode(['part' => gp_part_from_doc($doc)]);
    exit;
}

if ($method === 'DELETE') {
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
    $r = $col->deleteOne(['_id' => $oid]);
    if ($r->getDeletedCount() < 1) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'PATCH' || $method === 'PUT' || ($method === 'POST' && ($_GET['_action'] ?? '') !== 'delete')) {
    if ($id === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    $now = new \MongoDB\BSON\UTCDateTime();
    $set = [
        'slug' => trim((string) ($data['slug'] ?? '')),
        'name' => trim((string) ($data['name'] ?? '')),
        'brand' => trim((string) ($data['brand'] ?? '')),
        'partNumber' => trim((string) ($data['partNumber'] ?? '')),
        'category' => trim((string) ($data['category'] ?? '')),
        'description' => (string) ($data['description'] ?? ''),
        'price' => (float) ($data['price'] ?? 0),
        'stockQty' => (int) ($data['stockQty'] ?? 0),
        'image' => trim((string) ($data['image'] ?? '/placeholder-product.svg')) ?: '/placeholder-product.svg',
        'compatibility' => isset($data['compatibility']) && is_array($data['compatibility'])
            ? array_values(array_map('strval', $data['compatibility']))
            : [],
        'published' => (bool) ($data['published'] ?? true),
        'updatedAt' => $now,
    ];
    if ($set['slug'] === '' || $set['name'] === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $oid = new \MongoDB\BSON\ObjectId($id);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id']);
        exit;
    }

    $r = $col->updateOne(['_id' => $oid], ['$set' => $set]);
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
