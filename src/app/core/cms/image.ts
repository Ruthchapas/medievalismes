/**
 * Sanity serves images through its CDN and resizes them on request, so the same
 * photo can be asked for small (thumbnails) or large (full screen). Any other
 * URL is returned untouched.
 */
export function resized(url: string, width: number): string {
  return url.startsWith('https://cdn.sanity.io/') ? `${url}?w=${width}&auto=format` : url;
}
