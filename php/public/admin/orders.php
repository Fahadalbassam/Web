<?php
/**
 * GET — list orders (newest first) for admin dashboard.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();
gp_require_admin();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$col = gp_mongo_database()->selectCollection('orders');
$cursor = $col->find([], ['sort' => ['createdAt' => -1], 'limit' => 200]);
$out = [];
foreach ($cursor as $doc) {
    $d = gp_normalize_doc($doc);
    $full = gp_order_public_array($d);
    $cust = $full['customer'];
    $custEmail = is_array($cust) ? gp_auth_scalar_string($cust['email'] ?? '', '') : '';
    $out[] = [
        'id' => $full['id'],
        'userId' => $full['userId'],
        'userEmail' => $full['userEmail'] !== '' ? $full['userEmail'] : $custEmail,
        'customerName' => $full['customerName'],
        'total' => $full['total'],
        'status' => $full['status'],
        'createdAt' => $full['createdAt'],
        'updatedAt' => $full['updatedAt'],
        'itemCount' => count($full['items']),
    ];
}

echo json_encode(['orders' => $out]);
