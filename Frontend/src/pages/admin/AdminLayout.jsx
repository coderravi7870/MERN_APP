import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, LayoutDashboard, Package, ClipboardList,
  Users, BarChart3, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/inventory',  icon: Package,         label: 'Inventory' },
  { to: '/admin/orders',     icon: ClipboardList,   label: 'Orders' },
  { to: '/admin/staff',      icon: Users,           label: 'Staff' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'flex' : 'hidden md:flex'} flex-col h-full bg-gray-900 text-white`}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-9 h-9 bg-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <p className="font-display font-semibold text-sm leading-tight">Kirana Store</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        {mobile && (
          <button onClick={() => setOpen(false)} className="ml-auto text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-gray-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
            onClick={() => setOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-500" />
            <span className="font-semibold text-gray-800">Kirana Store</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}