<?php
/**
 * POST JSON — customer + shipping; uses session cart; writes orders collection; decrements stock.
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/include/cart.php';

gp_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

gp_require_checkout_customer();

$userId = (string) ($_SESSION['gp_checkout_customer_id'] ?? $_SESSION['gp_user_id'] ?? '');
$userEmail = strtolower(trim((string) ($_SESSION['gp_checkout_customer_email'] ?? $_SESSION['gp_user_email'] ?? '')));

$lines = gp_cart_hydrate();
if (count($lines) < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Cart is empty']);
    exit;
}

$data = gp_read_json_body();
$customer = [
    'fullName' => trim((string) ($data['fullName'] ?? '')),
    'email' => trim((string) ($data['email'] ?? '')),
    'phone' => trim((string) ($data['phone'] ?? '')),
];
$shipping = [
    'line1' => trim((string) ($data['line1'] ?? '')),
    'line2' => trim((string) ($data['line2'] ?? '')),
    'city' => trim((string) ($data['city'] ?? '')),
    'state' => trim((string) ($data['state'] ?? '')),
    'postal' => trim((string) ($data['postal'] ?? '')),
];

if ($customer['fullName'] === '' || $customer['email'] === '' || $shipping['line1'] === '' || $shipping['city'] === '' || $shipping['postal'] === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Order is tied to the signed-in session — contact email must match the account.
$customerEmailNorm = strtolower(trim($customer['email']));
if ($customerEmailNorm === '' || $customerEmailNorm !== $userEmail) {
    http_response_code(400);
    echo json_encode(['error' => 'Contact email must match your signed-in account']);
    exit;
}

$db = gp_mongo_database();
$products = $db->selectCollection('products');
$orders = $db->selectCollection('orders');

$orderLines = [];
$total = 0.0;
/** @var list<array{oid:\MongoDB\BSON\ObjectId,qty:int}> */
$applied = [];

foreach ($lines as $row) {
    $part = $row['part'];
    $qty = (int) $row['quantity'];
    $slug = (string) $part['slug'];
    $oidStr = (string) ($part['id'] ?? '');
    $unit = (float) ($part['price'] ?? 0);
    $stock = (int) ($part['stockQty'] ?? 0);

    if ($qty < 1 || $qty > $stock) {
        foreach ($applied as $ap) {
            $products->updateOne(
                ['_id' => $ap['oid']],
                ['$inc' => ['stockQty' => $ap['qty']]]
            );
        }
        http_response_code(400);
        echo json_encode(['error' => 'Quantity exceeds stock for ' . $slug]);
        exit;
    }

    try {
        $oid = new \MongoDB\BSON\ObjectId($oidStr);
    } catch (\Throwable $e) {
        foreach ($applied as $ap) {
            $products->updateOne(
                ['_id' => $ap['oid']],
                ['$inc' => ['stockQty' => $ap['qty']]]
            );
        }
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product']);
        exit;
    }

    $r = $products->updateOne(
        ['_id' => $oid, 'stockQty' => ['$gte' => $qty]],
        ['$inc' => ['stockQty' => -$qty], '$set' => ['updatedAt' => new \MongoDB\BSON\UTCDateTime()]]
    );
    if ($r->getModifiedCount() < 1) {
        foreach ($applied as $ap) {
            $products->updateOne(
                ['_id' => $ap['oid']],
                ['$inc' => ['stockQty' => $ap['qty']]]
            );
        }
        http_response_code(409);
        echo json_encode(['error' => 'Stock changed for ' . $slug]);
        exit;
    }

    $applied[] = ['oid' => $oid, 'qty' => $qty];

    $lineTotal = $unit * $qty;
    $total += $lineTotal;
    $orderLines[] = [
        'productId' => $oidStr,
        'slug' => $slug,
        'name' => (string) ($part['name'] ?? ''),
        'image' => (string) ($part['image'] ?? ''),
        'quantity' => $qty,
        'unitPrice' => $unit,
        'lineTotal' => $lineTotal,
    ];
}

$now = new \MongoDB\BSON\UTCDateTime();
$subtotal = round($total, 2);
$orderDoc = [
    'userId' => $userId,
    'userEmail' => $userEmail,
    'customerName' => $customer['fullName'],
    'createdAt' => $now,
    'updatedAt' => $now,
    'customer' => $customer,
    'shipping' => $shipping,
    'items' => $orderLines,
    'subtotal' => $subtotal,
    'total' => $subtotal,
    'status' => 'pending',
];

try {
    $res = $orders->insertOne($orderDoc);
} catch (\Throwable $e) {
    foreach ($applied as $ap) {
        $products->updateOne(
            ['_id' => $ap['oid']],
            ['$inc' => ['stockQty' => $ap['qty']]]
        );
    }
    http_response_code(500);
    echo json_encode(['error' => 'Could not save order']);
    exit;
}

$orderId = (string) $res->getInsertedId();

gp_cart_session_save([]);

$secure = getenv('NODE_ENV') === 'production' || getenv('GP_COOKIE_SECURE') === '1';
setcookie('gp_last_order_id', $orderId, [
    'expires' => time() + 86400 * 365,
    'path' => '/',
    'secure' => $secure,
    'httponly' => false,
    'samesite' => 'Lax',
]);

echo json_encode([
    'ok' => true,
    'orderId' => $orderId,
    'total' => round($total, 2),
]);
