<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/cart.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

gp_cart_session_save([]);
echo json_encode(['ok' => true, 'lines' => []]);
