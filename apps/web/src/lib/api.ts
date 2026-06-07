import type { PlayerSummary } from "@sehemistan/contracts";

// API URL tanımını doğrudan canlı Render sunucu adresinizle güncelledik
const API_URL = "https://sehemistan-api.onrender.com";

export interface ApiError {
  message: string;
}

export async function api<T extends object = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const payload: unknown = await response.json();
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "message" in payload
      ? String(payload.message)
      : "İstek tamamlanamadı.";
    throw new Error(message);
  }
  return payload as T;
}

export interface AuthResponse {
  token: string;
  player: PlayerSummary;
}

export const formatMoney = (value: string) =>
  new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 })
    .format(Number(value));

export const formatDuration = (endsAt: string) => {
  const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining].map((part) => String(part).padStart(2, "0")).join(":");
};