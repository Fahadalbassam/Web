<?php
/**
 * POST — same as auth/logout.php (single session bucket; alias for storefront callers).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

gp_session_start();
gp_clear_auth_identity_keys();
session_regenerate_id(true);

echo json_encode(['ok' => true]);
