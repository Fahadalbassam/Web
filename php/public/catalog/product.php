<?php
/**
 * GET — single product by slug (?slug=). Public; published only.
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
if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug']);
    exit;
}

$doc = gp_find_product_by_slug($slug, true);
if ($doc === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

echo json_encode(['part' => gp_part_from_doc($doc)]);
