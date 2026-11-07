/**
 * Sanity serves images through its CDN and resizes them on request, so the same
 * photo can be asked for small (thumbnails) or large (full screen). Any other
 * URL is returned untouched.
 */
export function resized(url: string, width: number): string {
  // Any size already asked for is replaced, so a URL can be resized again for a smaller use.
  return url.startsWith('https://cdn.sanity.io/') ? `${url.split('?')[0]}?w=${width}&auto=format` : url;
}
