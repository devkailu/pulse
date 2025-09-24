// client/src/utils/avatar.ts
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// client/src/utils/avatar.ts
export function getAvatarUrl(path: string | undefined) {
  if (!path) return "";
  // Add server base URL if needed
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${path}`;
}

