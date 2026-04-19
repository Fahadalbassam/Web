<?php
/**
 * GET — { authenticated, email? } for storefront session (checkout identity).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_session_start();

if (!empty($_SESSION['gp_checkout_customer_id']) && !empty($_SESSION['gp_checkout_customer_email'])) {
    echo json_encode([
        'authenticated' => true,
        'email' => (string) $_SESSION['gp_checkout_customer_email'],
    ]);
    exit;
}

http_response_code(401);
echo json_encode(['authenticated' => false]);
