// client/src/utils/avatar.ts
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function getAvatarUrl(path?: string | null) {
  if (!path) {
    // fallback placeholder
    return "https://via.placeholder.com/150?text=Avatar";
  }

  // Ensure leading slash
  const fixedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${fixedPath}`;
}