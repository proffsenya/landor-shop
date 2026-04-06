import { getAuthToken } from "@/utils/auth";
import { safeError } from "@/utils/logger";

export async function fetchUserProfile() {
  const token = getAuthToken();
  if (!token || token === "guest") throw new Error("UNAUTHORIZED");
  const res = await fetch("/api/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateUserProfile(data) {
  const token = getAuthToken();
  if (!token || token === "guest") throw new Error("UNAUTHORIZED");
  const res = await fetch("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function changeUserPassword(currentPassword, newPassword, confirmPassword) {
  const token = getAuthToken();
  if (!token || token === "guest") throw new Error("UNAUTHORIZED");
  const res = await fetch("/api/users/profile/changepassword", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || text;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}