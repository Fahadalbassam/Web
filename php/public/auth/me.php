<?php
/**
 * GET — { authenticated, email? } for AdminSessionProvider + Next middleware.
 * Validates MongoDB admin document + role (not session keys alone).
 * Always HTTP 200 with JSON body (no 401) so clients treat “guest” as a normal state.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_session_start();

if (empty($_SESSION['admin_id']) || empty($_SESSION['admin_email'])) {
    echo json_encode(['authenticated' => false]);
    exit;
}

$doc = gp_find_admin_by_id_string((string) $_SESSION['admin_id']);
$sessionEmail = strtolower(trim((string) $_SESSION['admin_email']));

if ($doc === null) {
    unset($_SESSION['admin_id'], $_SESSION['admin_email']);
    echo json_encode(['authenticated' => false]);
    exit;
}

$dbEmail = strtolower(trim((string) ($doc['email'] ?? '')));

if (
    (string) ($doc['role'] ?? '') !== 'admin'
    || $dbEmail === ''
    || $dbEmail !== $sessionEmail
) {
    unset($_SESSION['admin_id'], $_SESSION['admin_email']);
    echo json_encode(['authenticated' => false]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'email' => (string) $_SESSION['admin_email'],
]);
