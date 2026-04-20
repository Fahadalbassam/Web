<?php
/**
 * GET — admin session probe for middleware + AdminSessionProvider.
 * Authenticated only when DB role is admin (unified gp_user_* or legacy admin_* session).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_session_start();

$id = (string) ($_SESSION['gp_user_id'] ?? $_SESSION['admin_id'] ?? '');
$sessEmail = strtolower(trim((string) ($_SESSION['gp_user_email'] ?? $_SESSION['admin_email'] ?? '')));

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

if (gp_auth_scalar_string($doc['role'] ?? '', '') !== 'admin') {
    // Signed-in customer — not staff; do not destroy their storefront session.
    echo json_encode(['authenticated' => false]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'email' => $sessEmail,
    'role' => 'admin',
]);
