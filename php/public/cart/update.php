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
// Prefer explicit session key from cart/get.php; fall back to legacy `slug` only.
$slug = trim((string) ($data['cartSlug'] ?? $data['slug'] ?? ''));
$qty = (int) ($data['quantity'] ?? 0);

if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug']);
    exit;
}

$lines = gp_cart_session_lines();
$next = [];
$matched = false;

foreach ($lines as $line) {
    $lineSlug = $line['slug'];
    // Case-insensitive match so client/part.slug cannot drift from session keys.
    $isRow = ($lineSlug === $slug) || (strcasecmp($lineSlug, $slug) === 0);
    if (!$isRow) {
        $next[] = $line;
        continue;
    }
    if ($matched) {
        $next[] = $line;
        continue;
    }
    $matched = true;
    if ($qty < 1) {
        continue;
    }
    $doc = gp_find_product_by_slug($lineSlug, true);
    if ($doc === null) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    $part = gp_part_from_doc($doc);
    $stock = (int) ($part['stockQty'] ?? 0);
    $next[] = ['slug' => $lineSlug, 'quantity' => min($stock, $qty)];
}

if (!$matched) {
    http_response_code(404);
    echo json_encode(['error' => 'Item not in cart']);
    exit;
}

gp_cart_session_save($next);
echo json_encode(['ok' => true, 'lines' => gp_cart_hydrate()]);
