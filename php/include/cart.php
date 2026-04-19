<?php
/**
 * Session cart helper — $_SESSION['gp_cart'] = list of { slug, quantity }.
 */

declare(strict_types=1);

require_once __DIR__ . '/app.php';

/** @return list<array{slug:string,quantity:int}> */
function gp_cart_session_lines(): array
{
    gp_session_start();
    $lines = $_SESSION['gp_cart'] ?? [];
    if (!is_array($lines)) {
        return [];
    }
    $out = [];
    foreach ($lines as $line) {
        if (!is_array($line)) {
            continue;
        }
        $slug = trim((string) ($line['slug'] ?? ''));
        $qty = max(0, (int) ($line['quantity'] ?? 0));
        if ($slug !== '' && $qty > 0) {
            $out[] = ['slug' => $slug, 'quantity' => $qty];
        }
    }
    return $out;
}

/** @param list<array{slug:string,quantity:int}> $lines */
function gp_cart_session_save(array $lines): void
{
    gp_session_start();
    $_SESSION['gp_cart'] = $lines;
}

/** @return list<array{part:array<string,mixed>,quantity:int}> */
function gp_cart_hydrate(): array
{
    $lines = gp_cart_session_lines();
    $out = [];
    foreach ($lines as $line) {
        $doc = gp_find_product_by_slug($line['slug'], true);
        if ($doc === null) {
            continue;
        }
        $part = gp_part_from_doc($doc);
        $qty = min($line['quantity'], max(0, (int) ($part['stockQty'] ?? 0)));
        if ($qty < 1) {
            continue;
        }
        $out[] = ['part' => $part, 'quantity' => $qty];
    }
    return $out;
}
