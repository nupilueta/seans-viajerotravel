import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Menu, X, Plane, LogOut, ShieldCheck, User, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const adminNav = [
  { label: 'Dashboard', path: '/travel', icon: LayoutDashboard },
  { label: 'Clients', path: '/travel/clients', icon: Users },
  { label: 'Tasks', path: '/travel/tasks', icon: ClipboardList },
  { label: 'Settings', path: '/travel/settings', icon: Settings },
];

const employeeNav = [
  { label: 'Clients', path: '/travel/clients', icon: Users },
  { label: 'My Tasks', path: '/travel/my-tasks', icon: ClipboardList },
];

export default function TravelLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const nav = isAdmin ? adminNav : employeeNav;

  const handleLogout = () => base44.auth.logout();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-sidebar flex flex-col transition-transform duration-300
        md:relative md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <Plane className="w-6 h-6 text-sidebar-primary" />
          <div>
            <p className="text-sidebar-primary font-bold text-sm">Sean's Viajero</p>
            <p className="text-sidebar-foreground text-xs opacity-60">Travel & Tours</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-sidebar-border">
          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full w-fit ${isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {isAdmin ? 'Admin' : 'Employee'}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-sidebar-foreground opacity-60 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Sean's Viajero</span>
          </div>
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}