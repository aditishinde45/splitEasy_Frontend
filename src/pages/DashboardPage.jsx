import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import {
  Users,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Receipt,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Utensils,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Home,
  Film,
  Zap,
  Tag,
  AlertCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Groceries: ShoppingCart,
  Rent: Home,
  Entertainment: Film,
  Utilities: Zap,
  Other: Tag,
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/summary');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const summary = data?.summary || {
    totalGroups: 0,
    totalExpenses: 0,
    totalPaidByUser: 0,
    totalUserOwes: 0,
    totalOwedToUser: 0,
    netTotal: 0,
  };

  const groupBalances = data?.groupBalancesSummary || [];
  const recentExpenses = data?.recentExpenses || [];
  const recentActivity = data?.recentActivity || [];
  const groups = data?.groups || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-emerald shadow-lg">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold mb-2 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Financial Overview
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Track your shared expenses, manage group contributions, and keep everyone settled easily.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-3 self-start sm:self-center flex-shrink-0">
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all active:scale-95 flex items-center space-x-2 backdrop-blur-sm"
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards Grid (5 Required Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Groups"
          value={summary.totalGroups}
          subtitle="Active sharing groups"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Total Group Expenses"
          value={`₹${summary.totalExpenses.toLocaleString()}`}
          subtitle="Combined spending"
          icon={Receipt}
          variant="default"
        />
        <StatCard
          title="Paid by You"
          value={`₹${summary.totalPaidByUser.toLocaleString()}`}
          subtitle="Your direct payments"
          icon={CreditCard}
          variant="blue"
        />
        <StatCard
          title="You Owe"
          value={`₹${summary.totalUserOwes.toLocaleString()}`}
          subtitle="To settle with others"
          icon={TrendingDown}
          variant="rose"
        />
        <StatCard
          title="You are Owed"
          value={`₹${summary.totalOwedToUser.toLocaleString()}`}
          subtitle="Others owe you"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* Outstanding Balances per Group Banner / Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Outstanding Balances by Group
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {groupBalances.length} groups analyzed
          </span>
        </div>

        {groupBalances.length === 0 ? (
          <EmptyState
            title="No group balances yet"
            description="Create your first group and add shared expenses to start tracking."
            actionText="Create Group"
            onAction={() => setIsCreateGroupOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groupBalances.map((gb) => {
              const isOwed = gb.userNetBalance > 0.05;
              const owes = gb.userNetBalance < -0.05;

              return (
                <div
                  key={gb.groupId}
                  className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-soft flex flex-col justify-between ${
                    isOwed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : owes
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 text-slate-700">
                        {gb.category}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isOwed
                            ? 'bg-emerald-100 text-emerald-800'
                            : owes
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOwed ? 'You get back' : owes ? 'You owe' : 'Settled up'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2 truncate">
                      {gb.groupName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total spending: ₹{gb.totalGroupExpenses.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Net Balance
                      </span>
                      <span
                        className={`text-lg font-black ${
                          isOwed
                            ? 'text-emerald-700'
                            : owes
                            ? 'text-rose-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {isOwed
                          ? `+₹${gb.userNetBalance.toFixed(2)}`
                          : owes
                          ? `-₹${Math.abs(gb.userNetBalance).toFixed(2)}`
                          : '₹0.00'}
                      </span>
                    </div>

                    <Link
                      to={`/groups/${gb.groupId}`}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Grid: Recent Expenses & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Expenses</h2>
              <p className="text-xs text-slate-500">Expenses across all your groups</p>
            </div>
            <Link
              to="/groups"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Explore Groups</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentExpenses.map((exp) => {
                const Icon = CATEGORY_ICONS[exp.category] || Tag;
                const isPayer =
                  (exp.paidBy?._id || exp.paidBy)?.toString() === user?._id?.toString();

                return (
                  <div
                    key={exp._id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors px-2 rounded-xl"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {exp.description}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {exp.groupId?.name} • Paid by {isPayer ? 'You' : exp.paidBy?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{exp.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(exp.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500">Live group updates</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((act) => (
                <div key={act._id} className="flex items-start space-x-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 leading-snug font-medium">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(act.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={(newGroup) => {
          fetchDashboardData();
          navigate(`/groups/${newGroup._id}`);
        }}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groups={groups}
        onExpenseSaved={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default DashboardPage;
