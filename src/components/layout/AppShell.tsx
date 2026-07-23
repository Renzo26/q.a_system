import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-shell text-ink">
      {/* Backdrop do drawer (mobile) */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-0 lg:py-2 lg:pr-2">
        <div className="grain relative flex flex-1 flex-col overflow-hidden rounded-none border-0 bg-canvas lg:rounded-[26px] lg:border lg:border-black/[0.06]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <main className="scroll-slim relative z-10 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
