import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            <span className="text-rose-500">Fact</span>Check.AI
          </h1>
        </div>
        <div className="text-xs sm:text-sm text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          v2.5.0-flash-integrated
        </div>
      </div>
    </header>
  );
};

export default Header;