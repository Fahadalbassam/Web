export const PHP_BROWSER_BASE = "/backend";

export function phpBrowserUrl(scriptPath: string): string {
  const p = scriptPath.replace(/^\/+/, "");
  return `${PHP_BROWSER_BASE}/${p}`;
}
