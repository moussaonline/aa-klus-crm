"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-800"
    >
      <LogOut size={18} aria-hidden />
      Uitloggen
    </button>
  );
}
