<?php
/**
 * GET — public product list. Query: published=1, limit=n, q=search (optional).
 * No session required.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$publishedOnly = (($_GET['published'] ?? '1') === '1');
$limit = isset($_GET['limit']) ? max(0, (int) $_GET['limit']) : 0;
$q = trim((string) ($_GET['q'] ?? ''));

$col = gp_mongo_database()->selectCollection('products');
$filter = [];
$parts = [];

if ($publishedOnly) {
    $parts[] = gp_match_published_catalog();
}

if ($q !== '') {
    $rx = ['$regex' => preg_quote($q, '/'), '$options' => 'i'];
    $parts[] = [
        '$or' => [
            ['name' => $rx],
            ['brand' => $rx],
            ['slug' => $rx],
            ['partNumber' => $rx],
            ['category' => $rx],
        ],
    ];
}

if (count($parts) === 1) {
    $filter = $parts[0];
} elseif (count($parts) > 1) {
    $filter = ['$and' => $parts];
}

$cursor = $col->find($filter, ['sort' => ['createdAt' => -1]]);
$out = [];
foreach ($cursor as $doc) {
    $d = gp_normalize_doc($doc);
    $out[] = gp_part_from_doc($d);
    if ($limit > 0 && count($out) >= $limit) {
        break;
    }
}

echo json_encode(['parts' => $out]);
