/**
 * Browser-facing PHP API prefix — Next.js rewrites `/backend/*` to PHP (see next.config.ts).
 */
export const PHP_BROWSER_BASE = "/backend";

/** e.g. `auth/login.php` → `/backend/auth/login.php` */
export function phpBrowserUrl(scriptPath: string): string {
  const p = scriptPath.replace(/^\/+/, "");
  return `${PHP_BROWSER_BASE}/${p}`;
}
