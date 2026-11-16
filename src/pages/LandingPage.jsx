import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Users,
  PieChart,
  ShieldCheck,
  Zap,
  Sparkles,
  IndianRupee,
  Receipt,
  Scale,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email) => {
    try {
      await login({ email, password: 'password123' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white text-slate-800">
      {/* Top Navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-emerald shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              SplitEasy
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 text-sm font-semibold rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-6 ring-1 ring-emerald-300/60">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Intelligent Shared Expense Management</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Split Expenses with Friends.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Zero Awkward Math.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          The modern expense sharing platform for roommates, trips, and friends. Track shared bills,
          calculate exact balances, and settle debts with optimized payment suggestions.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-2xl shadow-emerald shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button
            onClick={() => handleQuickDemoLogin('aman@example.com')}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-base font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Launch Live Demo</span>
          </button>
        </div>

        {/* Quick Demo 1-Click User Switcher Bar */}
        <div className="mt-8 p-4 max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-2xl border border-slate-200/90 shadow-sm text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Or test instantly with pre-seeded demo users:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: 'Aman', email: 'aman@example.com', role: 'Trip Admin' },
              { name: 'Riya', email: 'riya@example.com', role: 'Member' },
              { name: 'Karan', email: 'karan@example.com', role: 'Member' },
              { name: 'Sneha', email: 'sneha@example.com', role: 'Flatmate' },
            ].map((demo) => (
              <button
                key={demo.email}
                onClick={() => handleQuickDemoLogin(demo.email)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  {demo.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{demo.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Engine Highlight Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg p-6 sm:p-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold mb-2">
                Real-Time Calculation Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Goa Trip (Mandatory Test Case)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Expenses: <strong className="text-slate-800">₹1,200</strong> • Equal Share: <strong className="text-slate-800">₹400 / person</strong>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                3 Members
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                Accurate to ₹0.01
              </span>
            </div>
          </div>

          {/* Member Balance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Aman Sharma</span>
                <span className="text-[11px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded-full">
                  Receives
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700">+₹500</div>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between"><span>Paid for Dinner:</span><span className="font-semibold">₹900</span></div>
                <div className="flex justify-between"><span>Equal share:</span><span className="font-semibold">₹400</span></div>
                <div className="flex justify-between border-t border-emerald-200/60 pt-0.5 font-bold text-emerald-800">
                  <span>Gets back:</span><span>₹500</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">Riya Patel</span>
                <span className="text-[11px] font-bold text-rose-700 px-2 py-0.5 bg-rose-100 rounded-full">
                  Owes
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-rose-700">-₹100</div>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between"><span>Paid for Snacks:</span><span className="font-semibold">₹300</span></div>
                <div className="flex justify-between"><span>Equal share:</span><span className="font-semibold">₹400</span></div>
                <div className="flex justify-between border-t border-rose-200/60 pt-0.5 font-bold text-rose-800">
                  <span>Owes group:</span><span>₹100</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">Karan Verma</span>
                <span className="text-[11px] font-bold text-rose-700 px-2 py-0.5 bg-rose-100 rounded-full">
                  Owes
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-rose-700">-₹400</div>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between"><span>Paid:</span><span className="font-semibold">₹0</span></div>
                <div className="flex justify-between"><span>Equal share:</span><span className="font-semibold">₹400</span></div>
                <div className="flex justify-between border-t border-rose-200/60 pt-0.5 font-bold text-rose-800">
                  <span>Owes group:</span><span>₹400</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Payments Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Optimized Settlement Algorithm
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Suggested Payments (2 Transactions to Settle Everything):
              </h4>
              <ul className="text-xs text-slate-300 mt-1.5 space-y-1">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Riya</strong> pays <strong>Aman</strong> ₹100</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Karan</strong> pays <strong>Aman</strong> ₹400</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all self-start sm:self-center"
            >
              Test in App →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Built with Modern Engineering
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Everything you need to manage finances with friends, roommates, and groups smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Equal, Custom & Percentage Splits
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Split equally among everyone or specify exact custom rupees or percentage shares with real-time balance validation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Optimized Debt Simplification
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Minimizes total payment transfers among group members using a greedy graph optimization algorithm. Settle with 1-click.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Secure & Reliable Backend
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Protected by JWT in HTTP-only cookies, password hashing with bcrypt, integer paise safe arithmetic, and membership authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">SplitEasy</span>
            <span>— Shared Expense Management Platform</span>
          </div>
          <div className="text-slate-500">
            Full-Stack MERN Architecture • Powered by MongoDB, Express, React, Node.js
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
