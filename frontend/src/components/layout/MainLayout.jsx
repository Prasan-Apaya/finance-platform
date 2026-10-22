import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  Home01,
  List,
  PieChart01,
  Table,
  Moon01,
  Sun,
  LogOut01,
  Menu01,
  XClose,
} from '@untitledui/icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home01 },
  { path: '/transactions', label: 'Transactions', icon: List },
  { path: '/budgets', label: 'Budgets', icon: PieChart01 },
  { path: '/categories', label: 'Categories', icon: Table },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      document.documentElement.classList.contains('dark-mode') ||
      localStorage.getItem('theme') === 'dark'
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark');
      root.classList.remove('dark-mode');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName =
    user?.username && user.username !== 'undefined'
      ? user.username
      : user?.email || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
              isActive
                ? 'bg-brand-solid text-white shadow-xs'
                : 'text-tertiary hover:text-secondary_contrast hover:bg-primary_hover'
            }`}
          >
            <Icon
              className={`h-5 w-5 shrink-0 ${
                isActive ? 'text-white' : 'text-fg-quaternary'
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="border-t border-border-secondary pt-4 space-y-2">
      <div className="px-2 py-1">
        <p className="text-xs font-medium text-secondary_contrast truncate">
          {displayName}
        </p>
        {user?.email && user.email !== displayName && (
          <p className="text-xs text-tertiary truncate">{user.email}</p>
        )}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-tertiary hover:text-secondary_contrast hover:bg-primary_hover transition-colors cursor-pointer text-left"
      >
        {isDark ? (
          <>
            <Sun className="h-5 w-5 shrink-0 text-amber-500" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon01 className="h-5 w-5 shrink-0 text-fg-quaternary" />
            <span>Dark Mode</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error-primary hover:bg-error_subtle/30 transition-colors cursor-pointer text-left"
      >
        <LogOut01 className="h-5 w-5 shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary text-secondary_contrast">
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed on desktop; Drawer slide-out on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-secondary border-r border-border-secondary flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-brand-solid flex items-center justify-center text-white shadow-xs">
                <Home01 className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-secondary_contrast">
                Budget Planner
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-tertiary hover:text-secondary_contrast hover:bg-primary_hover transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <XClose className="h-5 w-5" />
            </button>
          </div>

          {renderNavLinks()}
        </div>

        {renderSidebarFooter()}
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-secondary/80 backdrop-blur-md border-b border-border-secondary">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 rounded-lg text-tertiary hover:text-secondary_contrast hover:bg-primary_hover transition-colors cursor-pointer"
                aria-label="Open navigation"
              >
                <Menu01 className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold text-secondary_contrast lg:hidden">
                Budget Planner
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-tertiary hover:text-secondary_contrast hover:bg-primary_hover transition-colors cursor-pointer"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon01 className="h-5 w-5 text-fg-quaternary" />
                )}
              </button>

              <div
                className="h-8 w-8 rounded-full bg-brand-solid flex items-center justify-center text-xs font-bold text-white shadow-xs"
                title={displayName}
              >
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
