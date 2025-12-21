import React from "react";

export default function AppFooter() {
  return (
    <footer className="w-full py-4 mt-8 border-t border-slate-200 bg-white print:hidden font-sans">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} <span className="text-slate-600 font-bold">STMIK IKMI Cirebon</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}