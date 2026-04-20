<?php
/**
 * Loads repo-root env files into PHP's runtime so `getenv()` matches Next.js `.env*` behavior.
 * PHP's built-in server does not read `.env.local`; Next.js does — this bridges local dev.
 */
declare(strict_types=1);

use Dotenv\Dotenv;

/**
 * Repo root = parent of `php/` (this file lives in `php/include/`).
 */
function gp_repo_root(): string
{
    return dirname(__DIR__, 2);
}

/**
 * Loads `.env` then `.env.local` when present (later file overrides). Uses unsafe mutable + putenv
 * so `gp_require_env()` / `getenv()` see values. Safe for missing files (production uses real env).
 */
function gp_load_repo_env(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    if (!class_exists(Dotenv::class)) {
        return;
    }

    $root = gp_repo_root();
    foreach (['.env', '.env.local'] as $name) {
        $full = $root . DIRECTORY_SEPARATOR . $name;
        if (!is_readable($full)) {
            continue;
        }
        Dotenv::createUnsafeMutable($root, $name, true)->safeLoad();
    }
}
