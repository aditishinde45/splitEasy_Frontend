import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Wallet,
  Bell,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  CheckCheck,
  Users,
  LayoutDashboard,
  Clock,
  Sparkles,
} from 'lucide-react';

const Navbar = ({ onOpenAddExpense, onOpenCreateGroup }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Groups', path: '/groups', icon: Users },
    { label: 'Activity', path: '/activity', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-emerald shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  SplitEasy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 -mt-1">
                  Finances
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            {onOpenAddExpense && (
              <button
                onClick={onOpenAddExpense}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => !n.isRead && markAsRead(n._id)}
                          className={`px-4 py-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className={`text-xs text-slate-800 ${!n.isRead ? 'font-semibold' : ''}`}>
                              {n.message}
                            </p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs ring-2 ring-emerald-500/20">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {onOpenAddExpense && (
              <div className="pt-2 px-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAddExpense();
                  }}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
