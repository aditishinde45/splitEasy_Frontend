import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import SettleDebtModal from '../components/modals/SettleDebtModal';
import AddMemberModal from '../components/modals/AddMemberModal';
import EditGroupModal from '../components/modals/EditGroupModal';
import {
  Users,
  Receipt,
  Scale,
  PlusCircle,
  HandCoins,
  ArrowRight,
  Edit,
  Trash2,
  UserPlus,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  Utensils,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Home,
  Film,
  Zap,
  Tag,
  ChevronDown,
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

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [balancesData, setBalancesData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userRole, setUserRole] = useState('member');
  const [activeTab, setActiveTab] = useState('balances'); // 'balances' | 'expenses' | 'settlements' | 'members' | 'activity'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  // Expense filters & search
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('All');
  const [expensePayer, setExpensePayer] = useState('All');
  const [expenseSort, setExpenseSort] = useState('date_desc');

  // Load all group data concurrently
  const loadGroupData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [groupRes, balancesRes, expensesRes, settlementsRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/balances`),
        api.get(`/expenses/group/${groupId}`),
        api.get(`/settlements/group/${groupId}`),
      ]);

      if (groupRes.success) {
        setGroup(groupRes.group);
        setUserRole(groupRes.userRole || 'member');
      }
      if (balancesRes.success) {
        setBalancesData(balancesRes.data);
      }
      if (expensesRes.success) {
        setExpenses(expensesRes.expenses || []);
      }
      if (settlementsRes.success) {
        setSettlements(settlementsRes.settlements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  // Handle Delete Group
  const handleDeleteGroup = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this group and all its records? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/groups/${groupId}`);
      if (res.success) {
        navigate('/groups');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete group.');
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.success) {
        loadGroupData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete expense.');
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (targetUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this group?`)) return;
    try {
      const res = await api.delete(`/groups/${groupId}/members/${targetUserId}`);
      if (res.success) {
        loadGroupData();
      }
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  if (loading && !group) {
    return <LoadingSpinner text="Loading group dashboard..." />;
  }

  if (error && !group) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied or Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => navigate('/groups')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to My Groups
        </button>
      </div>
    );
  }

  const currentUserBalance = balancesData?.balances?.find(
    (b) => b.user?._id?.toString() === user?._id?.toString()
  );

  // Filtered expenses
  const filteredExpenses = expenses
    .filter((e) => {
      const matchSearch = e.description.toLowerCase().includes(expenseSearch.toLowerCase());
      const matchCat = expenseCategory === 'All' || e.category === expenseCategory;
      const matchPayer =
        expensePayer === 'All' ||
        (e.paidBy?._id || e.paidBy).toString() === expensePayer;
      return matchSearch && matchCat && matchPayer;
    })
    .sort((a, b) => {
      if (expenseSort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (expenseSort === 'amount_desc') return b.amount - a.amount;
      if (expenseSort === 'amount_asc') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date); // date_desc
    });

  return (
    <div className="space-y-6 pb-16">
      {/* Group Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                {group.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Created {new Date(group.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {userRole === 'admin' && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-200 flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {group.description}
              </p>
            )}

            {/* Member Avatars */}
            <div className="flex items-center space-x-2 mt-4">
              <div className="flex -space-x-2">
                {group.members?.map((m, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center ring-2 ring-white"
                    title={`${m.user?.name} (${m.role})`}
                  >
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {group.members?.length} members
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsAddExpenseOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => {
                setSettlePrefill(null);
                setIsSettleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <HandCoins className="w-4 h-4 text-emerald-400" />
              <span>Settle Up</span>
            </button>

            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>

            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setIsEditGroupOpen(true)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  title="Edit Group"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3 Metrics Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Group Expenses
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{balancesData?.totalExpenses?.toLocaleString() || '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
              Across {balancesData?.expenseCount || 0} recorded bills
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Equal Share Per Member
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{balancesData?.equalShare?.toLocaleString() || '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
              Based on {balancesData?.memberCount || 0} members
            </span>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              (currentUserBalance?.netBalance || 0) > 0.05
                ? 'bg-emerald-50/70 border-emerald-200'
                : (currentUserBalance?.netBalance || 0) < -0.05
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Your Net Balance
            </span>
            <div
              className={`text-2xl font-black mt-1 ${
                (currentUserBalance?.netBalance || 0) > 0.05
                  ? 'text-emerald-700'
                  : (currentUserBalance?.netBalance || 0) < -0.05
                  ? 'text-rose-700'
                  : 'text-slate-800'
              }`}
            >
              {(currentUserBalance?.netBalance || 0) > 0.05
                ? `+₹${currentUserBalance.netBalance.toFixed(2)}`
                : (currentUserBalance?.netBalance || 0) < -0.05
                ? `-₹${Math.abs(currentUserBalance.netBalance).toFixed(2)}`
                : '₹0.00'}
            </div>
            <span className="text-[11px] font-bold mt-0.5 block">
              {(currentUserBalance?.netBalance || 0) > 0.05
                ? 'You get back from group'
                : (currentUserBalance?.netBalance || 0) < -0.05
                ? 'You owe to the group'
                : 'You are completely settled up'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'balances', label: 'Balances & Settle', count: balancesData?.settlementSuggestions?.length },
          { id: 'expenses', label: 'Expenses', count: expenses.length },
          { id: 'settlements', label: 'Settlements', count: settlements.length },
          { id: 'members', label: 'Members', count: group.members?.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === tab.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Balances & Settlement Suggestions */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          {/* Suggested Payments (Debt Simplification) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Suggested Payments</h3>
                <p className="text-xs text-slate-500">
                  Calculated automatically to settle all debts in the fewest possible payments
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                {balancesData?.settlementSuggestions?.length || 0} transfers needed
              </span>
            </div>

            {!balancesData?.settlementSuggestions || balancesData.settlementSuggestions.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/40 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-900">All Settled Up!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Nobody in this group owes money to anyone right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {balancesData.settlementSuggestions.map((suggestion, idx) => {
                  const isCurrentPayer =
                    suggestion.fromUser?._id?.toString() === user?._id?.toString();
                  const isCurrentRecipient =
                    suggestion.toUser?._id?.toString() === user?._id?.toString();

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-black flex items-center justify-center flex-shrink-0">
                          {suggestion.fromUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-slate-800 font-bold">
                            <span className={isCurrentPayer ? 'text-emerald-700 font-extrabold' : ''}>
                              {suggestion.fromUser?.name} {isCurrentPayer ? '(You)' : ''}
                            </span>{' '}
                            pays{' '}
                            <span className={isCurrentRecipient ? 'text-emerald-700 font-extrabold' : ''}>
                              {suggestion.toUser?.name} {isCurrentRecipient ? '(You)' : ''}
                            </span>
                          </p>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">
                            ₹{suggestion.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSettlePrefill(suggestion);
                          setIsSettleModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
                      >
                        <span>Settle Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Individual Member Balances Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Individual Member Balances
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Member</th>
                    <th className="pb-3 text-right">Total Paid</th>
                    <th className="pb-3 text-right">Total Share</th>
                    <th className="pb-3 text-right">Settlements</th>
                    <th className="pb-3 text-right">Net Balance</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balancesData?.balances?.map((b) => {
                    const isSelf = b.user?._id?.toString() === user?._id?.toString();
                    return (
                      <tr
                        key={b.user?._id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelf ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 pl-2 font-bold text-slate-900 flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {b.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span>{b.user?.name} {isSelf ? '(You)' : ''}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {b.user?.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-semibold text-slate-800">
                          ₹{b.totalPaid.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-slate-800">
                          ₹{b.totalShare.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-slate-500">
                          {b.settlementsPaid > 0 && `+₹${b.settlementsPaid.toFixed(2)} paid`}
                          {b.settlementsReceived > 0 && ` -₹${b.settlementsReceived.toFixed(2)} rec'd`}
                          {b.settlementsPaid === 0 && b.settlementsReceived === 0 && '—'}
                        </td>
                        <td className="py-3.5 text-right font-black text-sm">
                          <span
                            className={
                              b.netBalance > 0.05
                                ? 'text-emerald-700'
                                : b.netBalance < -0.05
                                ? 'text-rose-700'
                                : 'text-slate-600'
                            }
                          >
                            {b.netBalance > 0.05
                              ? `+₹${b.netBalance.toFixed(2)}`
                              : b.netBalance < -0.05
                              ? `-₹${Math.abs(b.netBalance).toFixed(2)}`
                              : '₹0.00'}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                              b.netBalance > 0.05
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.netBalance < -0.05
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.netBalance > 0.05
                              ? 'Gets back'
                              : b.netBalance < -0.05
                              ? 'Owes'
                              : 'Settled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Expenses CRUD List */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Controls: Search, Category, Payer, Sort */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={expensePayer}
                onChange={(e) => setExpensePayer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="All">All Payers</option>
                {group.members?.map((m) => (
                  <option key={(m.user?._id || m.user).toString()} value={(m.user?._id || m.user).toString()}>
                    Paid by {m.user?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={expenseSort}
                onChange={(e) => setExpenseSort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="date_desc">Newest Date First</option>
                <option value="date_asc">Oldest Date First</option>
                <option value="amount_desc">Highest Amount First</option>
                <option value="amount_asc">Lowest Amount First</option>
              </select>
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses match"
              description="Add your first shared expense to this group."
              actionText="Add Expense"
              onAction={() => {
                setExpenseToEdit(null);
                setIsAddExpenseOpen(true);
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const Icon = CATEGORY_ICONS[expense.category] || Tag;
                const isPayer =
                  (expense.paidBy?._id || expense.paidBy)?.toString() === user?._id?.toString();

                return (
                  <div
                    key={expense._id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {expense.description}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {expense.splitType} split
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Paid by <strong className="text-slate-800">{isPayer ? 'You' : expense.paidBy?.name}</strong> on{' '}
                          {new Date(expense.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>

                        {/* Participants badge stack */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {expense.participants?.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              {p.user?.name}: ₹{p.shareAmount?.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase block">Total</span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{expense.amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            setExpenseToEdit(expense);
                            setIsAddExpenseOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Settlements History */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Settlement History</h3>
              <p className="text-xs text-slate-500">Record of all payments between group members</p>
            </div>
            <button
              onClick={() => {
                setSettlePrefill(null);
                setIsSettleModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Record Payment
            </button>
          </div>

          {settlements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No settlements recorded in this group yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {settlements.map((s) => (
                <div
                  key={s._id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        <span>{s.paidBy?.name}</span> paid <span>{s.paidTo?.name}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(s.paymentDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        {s.notes && `• ${s.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-700">
                      ₹{s.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Members Directory */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Group Members</h3>
              <p className="text-xs text-slate-500">
                {group.members?.length} active members in this group
              </p>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.members?.map((m) => {
              const u = m.user;
              const uId = (u?._id || u).toString();
              const isSelf = uId === user?._id?.toString();
              const isAdmin = m.role === 'admin';

              const memberBalance = balancesData?.balances?.find(
                (b) => b.user?._id?.toString() === uId
              );

              return (
                <div
                  key={uId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                      {u?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900">{u?.name}</span>
                        {isSelf && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{u?.email}</p>
                      {memberBalance && (
                        <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                          Balance:{' '}
                          <span
                            className={
                              memberBalance.netBalance > 0.05
                                ? 'text-emerald-700'
                                : memberBalance.netBalance < -0.05
                                ? 'text-rose-700'
                                : 'text-slate-600'
                            }
                          >
                            ₹{memberBalance.netBalance.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {(userRole === 'admin' || isSelf) && (
                    <button
                      onClick={() => handleRemoveMember(uId, u?.name)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                      title={
                        Math.abs(memberBalance?.netBalance || 0) > 0.05
                          ? 'Cannot remove member with non-zero balance'
                          : 'Remove member'
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseToEdit(null);
        }}
        group={group}
        expenseToEdit={expenseToEdit}
        onExpenseSaved={() => {
          loadGroupData();
        }}
      />

      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
          setSettlePrefill(null);
        }}
        group={group}
        prefill={settlePrefill}
        onSettlementRecorded={() => {
          loadGroupData();
        }}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        group={group}
        onMemberAdded={() => {
          loadGroupData();
        }}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        group={group}
        onGroupUpdated={() => {
          loadGroupData();
        }}
      />
    </div>
  );
};

export default GroupDetailPage;
