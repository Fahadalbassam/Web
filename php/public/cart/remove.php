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

if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug']);
    exit;
}

$lines = gp_cart_session_lines();
$next = array_values(array_filter($lines, static fn ($l) => ($l['slug'] ?? '') !== $slug));
gp_cart_session_save($next);
echo json_encode(['ok' => true, 'lines' => gp_cart_hydrate()]);
