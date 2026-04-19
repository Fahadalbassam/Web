<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/cart.php';

gp_json_headers();

$lines = gp_cart_hydrate();
echo json_encode(['lines' => $lines]);
