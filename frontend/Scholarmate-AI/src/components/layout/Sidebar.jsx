import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navlinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-slate-200/60 z-50 md:relative md:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Close button for mobile */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200/60">
          {/* Reduced height: h-16 → h-14 | Reduced padding: px-5 → px-4 */}
          <div className="flex items-center gap-2">
            {/* Reduced gap: gap-3 → gap-2 */}
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
              {/* Reduced icon container: w-9 h-9 → w-8 h-8 | icon size: 20 → 18 */}
              <BrainCircuit className="text-white" size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xs md:text-sm font-semibold text-slate-900 tracking-tight">
              {/* Smaller, tighter text */}
              ScholarMate AI Learning Assistant
            </h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-slate-800">
            <X size={20} strokeWidth={2} /> {/* Slightly smaller close icon */}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {/* Reduced vertical padding: py-6 → py-5 | space-y-1.5 → space-y-1 */}
          {navlinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow shadow-emerald-500/20'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={16} // 👈 Slightly smaller nav icons (18 → 16)
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="px-3 py-3 border-t border-slate-200/60">
          {/* Reduced padding: py-4 → py-3 */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={2.5} className="transition-transform duration-200 group-hover:scale-110" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;