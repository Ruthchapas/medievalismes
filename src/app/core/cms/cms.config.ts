// Identifies the Sanity project to read from. None of this is secret: reading
// published content needs no token, and the project ID is public by design.
export const CMS = {
  projectId: '3gwdnd3t',
  dataset: 'production',
  apiVersion: '2025-01-01',
} as const;
