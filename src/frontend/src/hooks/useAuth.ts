import { useState } from "react";
import type { UserProfile } from "../types";

const STORAGE_KEY = "quizzo_user";

function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveUser(user: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(loadUser);

  function loginAsGuest() {
    const id = Math.floor(Math.random() * 9000 + 1000).toString();
    const profile: UserProfile = {
      id: `guest_${Date.now()}`,
      name: `Guest_${id}`,
      email: "",
      provider: "guest",
    };
    saveUser(profile);
    setUser(profile);
  }

  function loginWithProvider(
    name: string,
    email: string,
    provider: "google" | "facebook",
  ) {
    const profile: UserProfile = {
      id: `${provider}_${Date.now()}`,
      name:
        name.trim() ||
        (provider === "google" ? "Google User" : "Facebook User"),
      email: email.trim(),
      provider,
    };
    saveUser(profile);
    setUser(profile);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return { user, loginAsGuest, loginWithProvider, logout };
}
