import { safeWarn } from "@/utils/logger";

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

export async function fetchFavorites(authToken) {
  const res = await fetch("/api/favorites", {
    headers: authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {},
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`HTTP ${res.status}${body ? ` · ${body}` : ""}`);
  }
  return res.json();
}

export async function deleteFavoriteItem(id, authToken) {
  const headers = authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  const res = await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const body = await safeText(res);
    safeWarn(`DELETE /favorites/${id} failed: ${res.status}`, body);
    return false;
  }
  return true;
}

export async function deleteAllFavorites(authToken) {
  const headers = authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  // попытка без тела
  let res = await fetch("/api/favorites", { method: "DELETE", headers });
  if (res.ok) return true;
  if (res.status === 401) throw new Error("UNAUTHORIZED");

  // попытка с телом { all: true }
  res = await fetch("/api/favorites", {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ all: true }),
  });
  if (res.ok) return true;
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return false;
}

export async function moveToCart(variantIds, authToken) {
  if (!variantIds || variantIds.length === 0) return false;
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const res = await fetch("/api/favorites/move-to-cart", {
    method: "POST",
    headers,
    body: JSON.stringify(variantIds),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.ok;
}

// Добавить в favoritesService.js:

export async function addFavorite(variantId, authToken) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers,
    body: JSON.stringify({ variantId: Number(variantId) }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

export async function removeFavorite(variantId, authToken) {
  const headers = authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  // Попытка 1: DELETE /favorites/:variantId
  let res = await fetch(`/api/favorites/${encodeURIComponent(variantId)}`, { method: "DELETE", headers });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.ok) return true;
  // Попытка 2: DELETE /favorites?variantId=...
  res = await fetch(`/api/favorites?variantId=${encodeURIComponent(variantId)}`, { method: "DELETE", headers });
  if (res.ok) return true;
  // Попытка 3: DELETE /favorites с body
  res = await fetch("/api/favorites", {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: Number(variantId) }),
  });
  return res.ok;
}