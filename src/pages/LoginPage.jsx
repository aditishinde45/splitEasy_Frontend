import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-emerald shadow-md">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
            SplitEasy
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Log in to manage your group expenses and balances
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Accounts
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('aman@example.com')}
                className="p-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Aman (Admin)</div>
                <div className="text-[10px] text-slate-400">Goa trip creator</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('riya@example.com')}
                className="p-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Riya Patel</div>
                <div className="text-[10px] text-slate-400">Snacks payer</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('karan@example.com')}
                className="p-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Karan Verma</div>
                <div className="text-[10px] text-slate-400">Flatmate / owes</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sneha@example.com')}
                className="p-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Sneha Rao</div>
                <div className="text-[10px] text-slate-400">Apartment flatmate</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
