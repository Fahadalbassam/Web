<?php
/**
 * GET — all products (admin). POST — create. Requires admin session.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    gp_require_admin();
    $q = trim((string) ($_GET['q'] ?? ''));
    $col = gp_mongo_database()->selectCollection('products');
    $filter = [];
    if ($q !== '') {
        $rx = ['$regex' => preg_quote($q, '/'), '$options' => 'i'];
        $filter['$or'] = [
            ['name' => $rx],
            ['brand' => $rx],
            ['slug' => $rx],
            ['partNumber' => $rx],
            ['category' => $rx],
        ];
    }
    // Newest catalog entries first (aligns with storefront “latest” ordering).
    $cursor = $col->find($filter, ['sort' => ['createdAt' => -1]]);
    $out = [];
    foreach ($cursor as $doc) {
        $out[] = gp_part_from_doc(gp_normalize_doc($doc));
    }
    echo json_encode(['parts' => $out]);
    exit;
}

if ($method === 'POST') {
    gp_require_admin();
    $data = gp_read_json_body();
    $slug = trim((string) ($data['slug'] ?? ''));
    $name = trim((string) ($data['name'] ?? ''));
    if ($slug === '' || $name === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $now = new \MongoDB\BSON\UTCDateTime();
    $doc = [
        'slug' => $slug,
        'name' => $name,
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
        'createdAt' => $now,
        'updatedAt' => $now,
    ];

    $col = gp_mongo_database()->selectCollection('products');
    try {
        $r = $col->insertOne($doc);
        $id = (string) $r->getInsertedId();
        echo json_encode(['id' => $id]);
    } catch (\Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Could not create (duplicate slug?)']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
