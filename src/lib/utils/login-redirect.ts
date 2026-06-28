/** Routes that require sign-in — not valid "back to reading" targets for visitors. */
const AUTH_REQUIRED_ROUTES = ["/profile"];

/**
 * Sanitizes post-login / back navigation targets so visitors are not sent
 * into auth-gated routes (which would bounce them straight back to /login).
 */
export function getPublicReturnPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  if (path.startsWith("/login")) {
    return "/";
  }

  if (AUTH_REQUIRED_ROUTES.some((route) => path.startsWith(route))) {
    return "/";
  }

  return path;
}

export function buildLoginHref(returnPath: string): string {
  return `/login?redirect=${encodeURIComponent(getPublicReturnPath(returnPath))}`;
}
