"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

type NavbarProps = {
  onOpenSidebar?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
};

export default function Navbar({ onOpenSidebar, onToggleCollapse, isCollapsed }: NavbarProps) {
  // State untuk Tooltip Toggle
  const [showToggleTooltip, setShowToggleTooltip] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const [toggleCoords, setToggleCoords] = useState({ top: 0, left: 0 });

  // Handler Hover untuk Toggle Button
  const handleToggleMouseEnter = () => {
    if (!toggleBtnRef.current) return;
    const rect = toggleBtnRef.current.getBoundingClientRect();
    setToggleCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 10 // Muncul di sebelah kanan agar sama dengan menu sidebar
    });
    setShowToggleTooltip(true);
  };

  const handleToggleMouseLeave = () => {
    setShowToggleTooltip(false);
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md print:hidden">
      <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* === LEFT SECTION === */}
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Tombol Mobile */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full
                       text-slate-600 hover:bg-slate-100/60 transition
                       focus:outline-none focus:ring-0"
            aria-label="Buka menu"
          >
            <MenuIcon />
          </button>

          {/* Tombol Desktop (Toggle Sidebar) */}
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={onToggleCollapse}
            onMouseEnter={handleToggleMouseEnter}
            onMouseLeave={handleToggleMouseLeave}
            className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-full
                       text-slate-600 hover:bg-slate-100/60 transition
                       focus:outline-none focus:ring-0"
            // Hapus title standar browser
            // title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ArrowRightIcon /> : <MenuAltIcon />}
          </button>

          {/* TOOLTIP PORTAL UNTUK TOGGLE */}
          {showToggleTooltip && createPortal(
            <div 
              className="fixed z-[9999] px-3 py-2 bg-slate-800 text-white text-[11px] font-medium rounded shadow-xl pointer-events-none whitespace-nowrap"
              style={{
                top: `${toggleCoords.top}px`,
                left: `${toggleCoords.left}px`,
                transform: "translateY(-50%)" 
              }}
            >
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              {/* Panah */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
            </div>,
            document.body
          )}

          {/* --- SEARCH BAR --- */}
          <div className="hidden md:block ml-2">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Cari data..."
                className="w-52 lg:w-60 rounded-full bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-700 border border-transparent outline-none transition-all duration-200 hover:bg-slate-100/70 focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

        </div>

        {/* === RIGHT SECTION (Profile) === */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            type="button"
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 focus:outline-none focus:ring-0"
            aria-label="Cari"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className="group flex items-center gap-2 rounded-full p-1.5 transition-colors duration-200 hover:bg-slate-100/60 focus:outline-none focus:ring-0 active:ring-0"
          >
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-xs font-semibold text-slate-700 transition-colors duration-200 group-hover:text-slate-900">
                Azharangga Kusuma
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                Administrator
              </span>
            </div>
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-all duration-200 group-hover:from-white group-hover:to-slate-100">
              <span className="absolute inset-0 rounded-full ring-1 ring-slate-200 group-hover:ring-slate-300" />
              <UserIcon />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ================= ICONS ================= */
function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function MenuAltIcon() {
  return (
     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}
function ArrowRightIcon() {
    return (
       <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    );
}
function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="h-5 w-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}