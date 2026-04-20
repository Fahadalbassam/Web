<?php
/**
 * Gulf Parts Co — PHP backend core (MongoDB + JSON API).
 * Course alignment: PHP sessions/cookies are the authority for cart + admin auth.
 */

declare(strict_types=1);

$composer = dirname(__DIR__) . '/vendor/autoload.php';
if (!is_file($composer)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Run `composer install` in the php/ directory.']);
    exit;
}

require_once $composer;

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

require_once __DIR__ . '/load-env.php';
gp_load_repo_env();

function gp_require_env(string $key): string
{
    $v = getenv($key);
    if ($v === false || $v === '') {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => "Missing environment variable: {$key}"]);
        exit;
    }
    return $v;
}

/** @var \MongoDB\Database|null */
$GLOBALS['_gp_db'] = null;

function gp_mongo_database(): \MongoDB\Database
{
    if ($GLOBALS['_gp_db'] instanceof \MongoDB\Database) {
        return $GLOBALS['_gp_db'];
    }

    $uri = gp_require_env('MONGODB_URI');
    $client = new Client($uri);

    $dbName = null;
    $parts = parse_url($uri);
    if (!empty($parts['path'])) {
        $dbName = trim((string) $parts['path'], '/');
        $dbName = preg_replace('/\?.*$/', '', $dbName ?? '');
    }
    if ($dbName === '' || $dbName === null) {
        $dbName = 'carparts_catalog';
    }

    $GLOBALS['_gp_db'] = $client->selectDatabase($dbName);
    return $GLOBALS['_gp_db'];
}

function gp_json_headers(): void
{
    header('Content-Type: application/json; charset=utf-8');
}

function gp_session_start(string $purpose = 'gp'): void
{
    $secure = getenv('NODE_ENV') === 'production' || getenv('GP_COOKIE_SECURE') === '1';

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

/**
 * @param mixed $doc
 * @return array<string,mixed>
 */
function gp_normalize_doc($doc): array
{
    if (is_array($doc)) {
        return $doc;
    }
    try {
        $arr = json_decode(json_encode($doc), true, 512, JSON_THROW_ON_ERROR);
        return is_array($arr) ? $arr : [];
    } catch (\Throwable $e) {
        return [];
    }
}

/** @param mixed $v */
function gp_iso_datetime($v): ?string
{
    if ($v instanceof \MongoDB\BSON\UTCDateTime) {
        return $v->toDateTime()->format(\DateTimeInterface::ATOM);
    }
    return null;
}

/** @param array<string,mixed> $doc */
function gp_oid_string(array $doc): ?string
{
    if (!isset($doc['_id'])) {
        return null;
    }
    return (string) $doc['_id'];
}

/** @param array<string,mixed>|object $doc */
function gp_stock_status(int $qty): string
{
    if ($qty <= 0) {
        return 'out_of_stock';
    }
    if ($qty <= 5) {
        return 'low_stock';
    }
    return 'in_stock';
}

/**
 * @param array<string,mixed> $doc
 * @return array<string,mixed>
 */
function gp_part_from_doc(array $doc): array
{
    $qty = (int) ($doc['stockQty'] ?? 0);
    $published = array_key_exists('published', $doc) ? (bool) $doc['published'] : true;

    return [
        'id' => gp_oid_string($doc) ?? '',
        'slug' => (string) ($doc['slug'] ?? ''),
        'name' => (string) ($doc['name'] ?? ''),
        'brand' => (string) ($doc['brand'] ?? ''),
        'partNumber' => (string) ($doc['partNumber'] ?? ''),
        'price' => (float) ($doc['price'] ?? 0),
        'image' => (string) ($doc['image'] ?? '/placeholder-product.svg'),
        'category' => (string) ($doc['category'] ?? ''),
        'description' => (string) ($doc['description'] ?? ''),
        'stockStatus' => gp_stock_status($qty),
        'compatibility' => isset($doc['compatibility']) && is_array($doc['compatibility'])
            ? array_values(array_map('strval', $doc['compatibility']))
            : [],
        'stockQty' => $qty,
        'published' => $published,
    ];
}

/**
 * Storefront “published” rule: visible unless explicitly published === false.
 * (Missing field, null, or true all surface on the storefront.)
 *
 * @return array<string,mixed>
 */
function gp_match_published_catalog(): array
{
    return ['published' => ['$ne' => false]];
}

/** @return array<string,mixed>|null */
function gp_find_product_by_slug(string $slug, bool $publishedOnly): ?array
{
    $col = gp_mongo_database()->selectCollection('products');
    $filter = $publishedOnly
        ? ['$and' => [['slug' => $slug], gp_match_published_catalog()]]
        : ['slug' => $slug];
    $doc = $col->findOne($filter);
    return $doc !== null ? gp_normalize_doc($doc) : null;
}

/** @return array<string,mixed>|null */
function gp_find_product_by_id(string $id): ?array
{
    try {
        $oid = new ObjectId($id);
    } catch (\Throwable $e) {
        return null;
    }
    $col = gp_mongo_database()->selectCollection('products');
    $doc = $col->findOne(['_id' => $oid]);
    return $doc !== null ? gp_normalize_doc($doc) : null;
}

/**
 * Unified auth documents live in `users`; legacy staff rows may still exist only in `admins`.
 *
 * @return array<string,mixed>|null
 */
function gp_find_auth_doc_by_id(string $id): ?array
{
    try {
        $oid = new ObjectId($id);
    } catch (\Throwable $e) {
        return null;
    }
    $db = gp_mongo_database();
    $users = $db->selectCollection('users');
    $doc = $users->findOne(['_id' => $oid]);
    if ($doc !== null) {
        return gp_normalize_doc($doc);
    }
    $admins = $db->selectCollection('admins');
    $doc = $admins->findOne(['_id' => $oid]);
    return $doc !== null ? gp_normalize_doc($doc) : null;
}

/**
 * Lookup by normalized email — `users` first, then legacy `admins`.
 *
 * @return array<string,mixed>|null
 */
function gp_find_auth_doc_by_email(string $email): ?array
{
    $email = strtolower(trim($email));
    if ($email === '') {
        return null;
    }
    $db = gp_mongo_database();
    $users = $db->selectCollection('users');
    $doc = $users->findOne(['email' => $email]);
    if ($doc !== null) {
        return gp_normalize_doc($doc);
    }
    $admins = $db->selectCollection('admins');
    $doc = $admins->findOne(['email' => $email]);
    return $doc !== null ? gp_normalize_doc($doc) : null;
}

/** @deprecated Use gp_find_auth_doc_by_id — kept for clarity in older comments */
function gp_find_admin_by_id_string(string $id): ?array
{
    return gp_find_auth_doc_by_id($id);
}

/** Clears unified session keys (cart lines are untouched). */
function gp_clear_auth_identity_keys(): void
{
    unset(
        $_SESSION['gp_user_id'],
        $_SESSION['gp_user_email'],
        $_SESSION['gp_user_role'],
        $_SESSION['admin_id'],
        $_SESSION['admin_email'],
        $_SESSION['gp_checkout_customer_id'],
        $_SESSION['gp_checkout_customer_email']
    );
}

/**
 * After successful password check: one session bucket for storefront + admin role gating.
 *
 * @param 'user'|'admin' $role
 */
function gp_commit_login_session(string $id, string $email, string $role): void
{
    gp_session_start();
    session_regenerate_id(true);
    $email = strtolower(trim($email));
    $_SESSION['gp_user_id'] = $id;
    $_SESSION['gp_user_email'] = $email;
    $_SESSION['gp_user_role'] = $role;
    $_SESSION['gp_checkout_customer_id'] = $id;
    $_SESSION['gp_checkout_customer_email'] = $email;
    if ($role === 'admin') {
        $_SESSION['admin_id'] = $id;
        $_SESSION['admin_email'] = $email;
    } else {
        unset($_SESSION['admin_id'], $_SESSION['admin_email']);
    }
}

/**
 * @return array{ok:true,id:string,email:string,role:string}|array{ok:false,code:int,error:string}
 */
function gp_try_login_credentials(string $email, string $password): array
{
    $email = strtolower(trim($email));
    if ($email === '' || $password === '') {
        return ['ok' => false, 'code' => 401, 'error' => 'Invalid credentials'];
    }
    $doc = gp_find_auth_doc_by_email($email);
    if ($doc === null) {
        return ['ok' => false, 'code' => 401, 'error' => 'Invalid credentials'];
    }
    $hash = (string) ($doc['passwordHash'] ?? '');
    if ($hash === '' || !password_verify($password, $hash)) {
        return ['ok' => false, 'code' => 401, 'error' => 'Invalid credentials'];
    }
    $role = (string) ($doc['role'] ?? 'user');
    if ($role !== 'admin' && $role !== 'user') {
        $role = 'user';
    }
    $id = gp_oid_string($doc);
    if ($id === null) {
        return ['ok' => false, 'code' => 500, 'error' => 'Server error'];
    }

    return ['ok' => true, 'id' => $id, 'email' => $email, 'role' => $role];
}

function gp_require_admin(): void
{
    gp_session_start();
    $id = (string) ($_SESSION['gp_user_id'] ?? $_SESSION['admin_id'] ?? '');
    $sessEmail = strtolower(trim((string) ($_SESSION['gp_user_email'] ?? $_SESSION['admin_email'] ?? '')));
    if ($id === '' || $sessEmail === '') {
        http_response_code(401);
        gp_json_headers();
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $doc = gp_find_auth_doc_by_id($id);
    if ($doc === null) {
        gp_clear_auth_identity_keys();
        http_response_code(401);
        gp_json_headers();
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $dbEmail = strtolower(trim((string) ($doc['email'] ?? '')));
    if ($dbEmail === '' || $dbEmail !== $sessEmail) {
        gp_clear_auth_identity_keys();
        http_response_code(401);
        gp_json_headers();
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    if ((string) ($doc['role'] ?? '') !== 'admin') {
        http_response_code(403);
        gp_json_headers();
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

/** Storefront checkout identity (legacy helper — prefer gp_commit_login_session). */
function gp_set_checkout_customer_session(string $id, string $email): void
{
    gp_session_start();
    $_SESSION['gp_checkout_customer_id'] = $id;
    $_SESSION['gp_checkout_customer_email'] = strtolower(trim($email));
}

function gp_require_checkout_customer(): void
{
    gp_session_start();
    $id = (string) ($_SESSION['gp_checkout_customer_id'] ?? $_SESSION['gp_user_id'] ?? '');
    $em = (string) ($_SESSION['gp_checkout_customer_email'] ?? $_SESSION['gp_user_email'] ?? '');
    if ($id === '' || $em === '') {
        http_response_code(401);
        gp_json_headers();
        echo json_encode(['error' => 'Sign in required to place an order']);
        exit;
    }
}

/** @return array<string,mixed> */
function gp_read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
