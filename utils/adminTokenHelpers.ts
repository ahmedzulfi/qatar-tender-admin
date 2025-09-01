// utils/adminTokenHelpers.ts
import { jwtDecode } from "jwt-decode";

export function setAdminTokenCookie(token: string) {
  if (typeof document === "undefined") return;

  try {
    const decoded: { exp?: number } = jwtDecode(token as string);
    const expiresIn = (decoded.exp ?? 0) * 1000 - Date.now();

    if (expiresIn <= 0) {
      console.warn("Attempted to set expired token");
      return;
    }

    const maxAge = Math.floor(expiresIn / 1000);
    // Use a different cookie name for admin to avoid conflicts
    document.cookie = `admin_auth_token=${encodeURIComponent(
      token
    )}; max-age=${maxAge}; path=/; secure; samesite=strict`;
  } catch (error) {
    console.error("Error setting admin token cookie:", error);
  }
}

export function getAdminTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; admin_auth_token=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(";").shift()!);
  }
  return null;
}

export function clearAdminTokens() {
  if (typeof document === "undefined") return;
  document.cookie = "admin_auth_token=; max-age=0; path=/; secure; samesite=strict";
}