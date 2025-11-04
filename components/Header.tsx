import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
           {/* Placeholder for potential future header content on the right */}
           <div className="flex-1 flex justify-end">
                {/* e.g., User avatar, notifications */}
           </div>
        </div>
      </div>
    </header>
  );
};