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
$addQty = max(1, (int) ($data['quantity'] ?? 1));

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
if ($stock < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Out of stock']);
    exit;
}

$lines = gp_cart_session_lines();
$found = false;
foreach ($lines as $i => $line) {
    if ($line['slug'] === $slug) {
        $lines[$i]['quantity'] = min($stock, $line['quantity'] + $addQty);
        $found = true;
        break;
    }
}
if (!$found) {
    $lines[] = ['slug' => $slug, 'quantity' => min($stock, $addQty)];
}

gp_cart_session_save($lines);
echo json_encode(['ok' => true, 'lines' => gp_cart_hydrate()]);
