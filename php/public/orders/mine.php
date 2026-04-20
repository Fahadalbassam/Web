<?php
/**
 * GET — orders for the signed-in storefront user only (MongoDB filter + ownership rules).
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/app.php';

gp_json_headers();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user = gp_storefront_authenticated_user();
if ($user === null) {
    http_response_code(401);
    echo json_encode(['error' => 'Sign in required']);
    exit;
}

$db = gp_mongo_database();
$col = $db->selectCollection('orders');

$email = $user['email'];
$filter = [
    '$or' => [
        ['userId' => $user['id']],
        ['userEmail' => $email],
        ['customer.email' => $email],
    ],
];

$cursor = $col->find($filter, ['sort' => ['createdAt' => -1], 'limit' => 100]);
$out = [];
foreach ($cursor as $doc) {
    $d = gp_normalize_doc($doc);
    if (!gp_order_user_can_view($d, $user['id'], $user['email'])) {
        continue;
    }
    $full = gp_order_public_array($d);
    $out[] = [
        'id' => $full['id'],
        'createdAt' => $full['createdAt'],
        'updatedAt' => $full['updatedAt'],
        'status' => $full['status'],
        'total' => $full['total'],
        'itemCount' => count($full['items']),
    ];
}

echo json_encode(['orders' => $out]);
