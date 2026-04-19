<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/cart.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = gp_read_json_body();
$slug = trim((string) ($data['slug'] ?? ''));
$qty = (int) ($data['quantity'] ?? 0);

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
$part = gp_part_from_doc($doc);
$stock = (int) ($part['stockQty'] ?? 0);

$lines = gp_cart_session_lines();
$next = [];
foreach ($lines as $line) {
    if ($line['slug'] === $slug) {
        if ($qty < 1) {
            continue;
        }
        $next[] = ['slug' => $slug, 'quantity' => min($stock, $qty)];
    } else {
        $next[] = $line;
    }
}

gp_cart_session_save($next);
echo json_encode(['ok' => true, 'lines' => gp_cart_hydrate()]);
