<?php
/**
 * GET ?slug=&limit= — published products same category excluding slug.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$slug = trim((string) ($_GET['slug'] ?? ''));
$limit = max(1, min(24, (int) ($_GET['limit'] ?? 4)));

if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug']);
    exit;
}

$doc = gp_find_product_by_slug($slug, true);
if ($doc === null) {
    echo json_encode(['parts' => []]);
    exit;
}

$category = (string) ($doc['category'] ?? '');
$col = gp_mongo_database()->selectCollection('products');
$cursor = $col->find(
    [
        '$and' => [
            gp_match_published_catalog(),
            ['category' => $category, 'slug' => ['$ne' => $slug]],
        ],
    ],
    ['sort' => ['createdAt' => -1], 'limit' => $limit]
);

$out = [];
foreach ($cursor as $row) {
    $out[] = gp_part_from_doc(gp_normalize_doc($row));
}

echo json_encode(['parts' => $out]);
