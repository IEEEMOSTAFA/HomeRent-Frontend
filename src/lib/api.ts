// src/lib/api.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {

  // ✅ সবসময় full URL use করো — server ও browser দুটোতেই কাজ করবে
  const url = `${BACKEND_URL}/api${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API Error: ${res.status}`, errorText);
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

