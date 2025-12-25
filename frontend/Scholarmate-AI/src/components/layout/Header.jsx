import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      {/* Reduced height: h-16 → h-14 */}
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2} /> {/* Slightly smaller */}
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-2">
          {/* Reduced gap: gap-3 → gap-2 */}

          <button className="relative inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
            {/* Reduced size: w-10 h-10 → w-9 h-9 */}
            <Bell size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
            {/* Slightly smaller bell: 20 → 18 */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            {/* Slightly smaller dot: w-2 h-2 → w-1.5 h-1.5 */}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/60">
            {/* Reduced: gap-3 → gap-2 | pl-3 → pl-2 */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
              {/* Reduced: gap-3 → gap-2 | px-3 py-1.5 → px-2.5 py-1 | rounded-xl → rounded-lg */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow shadow-emerald-500/20 group-hover:shadow-md group-hover:shadow-emerald-500/30 transition-all duration-200">
                {/* Fixed typo: was "1-9" → now "w-8 h-8" */}
                <User size={16} strokeWidth={2.5} />
                {/* Smaller user icon: 18 → 16 */}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900">
                  {/* Smaller text: text-sm → text-xs | font-semibold → font-medium */}
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {/* Tiny email font */}
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;