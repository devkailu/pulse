export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function getUploadUrl(path?: string | null) {
  if (!path) return "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${normalized}`;
}