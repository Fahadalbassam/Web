<?php
/**
 * GET — storefront session; always HTTP 200 + JSON (guest is normal).
 * Returns role from MongoDB for trusted UI (admin vs user).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_session_start();

$id = (string) ($_SESSION['gp_user_id'] ?? $_SESSION['gp_checkout_customer_id'] ?? '');
$sessEmail = strtolower(trim((string) ($_SESSION['gp_user_email'] ?? $_SESSION['gp_checkout_customer_email'] ?? '')));

if ($id === '' || $sessEmail === '') {
    echo json_encode(['authenticated' => false]);
    exit;
}

$doc = gp_find_auth_doc_by_id($id);
if ($doc === null) {
    gp_clear_auth_identity_keys();
    echo json_encode(['authenticated' => false]);
    exit;
}

$dbEmail = strtolower(trim(gp_auth_scalar_string($doc['email'] ?? '', '')));
if ($dbEmail === '' || $dbEmail !== $sessEmail) {
    gp_clear_auth_identity_keys();
    echo json_encode(['authenticated' => false]);
    exit;
}

$role = gp_auth_scalar_string($doc['role'] ?? 'user', 'user');
if ($role !== 'admin' && $role !== 'user') {
    $role = 'user';
}

echo json_encode([
    'authenticated' => true,
    'email' => $sessEmail,
    'role' => $role,
]);
