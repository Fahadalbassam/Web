<?php
/**
 * GET — storefront session; always HTTP 200 + JSON (guest is normal).
 * Returns role from MongoDB for trusted UI (admin vs user).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

$user = gp_storefront_authenticated_user();
if ($user === null) {
    echo json_encode(['authenticated' => false]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'userId' => $user['id'],
    'email' => $user['email'],
    'role' => $user['role'],
]);
