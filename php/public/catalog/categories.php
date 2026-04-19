<?php
/**
 * GET — { categories: string[] } for admin product form + tooling.
 * Source: `categories` collection (`name` field) merged with distinct `category` on `products`.
 * No auth required (names are not secret); admin form uses same list as storefront taxonomy.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$db = gp_mongo_database();
$names = [];

$catCol = $db->selectCollection('categories');
$cur = $catCol->find([], ['sort' => ['name' => 1], 'projection' => ['name' => 1]]);
foreach ($cur as $row) {
    $r = gp_normalize_doc($row);
    $n = trim((string) ($r['name'] ?? ''));
    if ($n !== '') {
        $names[$n] = true;
    }
}

$prodCol = $db->selectCollection('products');
$distinct = $prodCol->distinct('category', ['category' => ['$nin' => ['', null]]]);
if (is_array($distinct)) {
    foreach ($distinct as $d) {
        $n = trim((string) $d);
        if ($n !== '') {
            $names[$n] = true;
        }
    }
}

$list = array_keys($names);
sort($list, SORT_STRING | SORT_FLAG_CASE);

// So the admin Select always has at least one backend-driven option before any products exist.
if (count($list) === 0) {
    $list = ['General'];
}

echo json_encode(['categories' => $list]);
