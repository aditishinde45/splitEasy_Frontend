import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Home,
  Film,
  Zap,
  Tag,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Users,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'Food', icon: Utensils },
  { label: 'Travel', icon: Plane },
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Groceries', icon: ShoppingCart },
  { label: 'Rent', icon: Home },
  { label: 'Entertainment', icon: Film },
  { label: 'Utilities', icon: Zap },
  { label: 'Other', icon: Tag },
];

const AddExpenseModal = ({
  isOpen,
  onClose,
  group: initialGroup,
  groups = [],
  expenseToEdit = null,
  onExpenseSaved,
}) => {
  const { user } = useAuth();

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom' | 'percentage'

  // Map of participant shares: { [userId]: { selected: boolean, customAmount: string, percentage: string } }
  const [participantState, setParticipantState] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active group data
  const currentGroup = useMemo(() => {
    if (initialGroup) return initialGroup;
    return groups.find((g) => g._id === selectedGroupId) || null;
  }, [initialGroup, groups, selectedGroupId]);

  // Initialize form when opened or when group/expenseToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (expenseToEdit) {
      setSelectedGroupId(expenseToEdit.groupId?._id || expenseToEdit.groupId);
      setDescription(expenseToEdit.description || '');
      setAmount(expenseToEdit.amount?.toString() || '');
      setPaidBy(expenseToEdit.paidBy?._id || expenseToEdit.paidBy || '');
      setCategory(expenseToEdit.category || 'Food');
      setDate(
        expenseToEdit.date
          ? new Date(expenseToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setSplitType(expenseToEdit.splitType || 'equal');

      // Initialize participants from expense
      const state = {};
      if (currentGroup?.members) {
        currentGroup.members.forEach((m) => {
          const uId = (m.user?._id || m.user).toString();
          const p = expenseToEdit.participants?.find(
            (part) => (part.user?._id || part.user).toString() === uId
          );
          state[uId] = {
            selected: !!p,
            customAmount: p ? p.shareAmount?.toString() : '',
            percentage: p ? p.sharePercentage?.toString() : '',
          };
        });
      }
      setParticipantState(state);
    } else {
      // New expense setup
      if (initialGroup) {
        setSelectedGroupId(initialGroup._id);
      } else if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0]._id);
      }
      setDescription('');
      setAmount('');
      setPaidBy(user?._id || '');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setSplitType('equal');
      setError('');
    }
  }, [isOpen, expenseToEdit, initialGroup, groups, user]);

  // Setup participants when currentGroup changes for a new expense
  useEffect(() => {
    if (!expenseToEdit && currentGroup?.members) {
      const state = {};
      currentGroup.members.forEach((m) => {
        const uId = (m.user?._id || m.user).toString();
        state[uId] = {
          selected: true,
          customAmount: '',
          percentage: (100 / currentGroup.members.length).toFixed(1),
        };
      });
      setParticipantState(state);

      if (!paidBy && currentGroup.members.length > 0) {
        // Default paidBy to current user if member, else first member
        const hasCurrentUser = currentGroup.members.some(
          (m) => (m.user?._id || m.user).toString() === user?._id.toString()
        );
        setPaidBy(hasCurrentUser ? user._id : (currentGroup.members[0].user?._id || currentGroup.members[0].user).toString());
      }
    }
  }, [currentGroup, expenseToEdit, user]);

  const numAmount = parseFloat(amount) || 0;

  // Selected participant count
  const selectedParticipantIds = useMemo(() => {
    return Object.keys(participantState).filter((id) => participantState[id]?.selected);
  }, [participantState]);

  // Equal share calculation preview
  const equalShareAmount = useMemo(() => {
    if (selectedParticipantIds.length === 0 || numAmount <= 0) return 0;
    return Number((numAmount / selectedParticipantIds.length).toFixed(2));
  }, [numAmount, selectedParticipantIds]);

  // Custom split sum calculation
  const customSplitSum = useMemo(() => {
    return selectedParticipantIds.reduce((sum, id) => {
      const val = parseFloat(participantState[id]?.customAmount) || 0;
      return sum + val;
    }, 0);
  }, [selectedParticipantIds, participantState]);

  // Percentage split sum calculation
  const percentageSplitSum = useMemo(() => {
    return selectedParticipantIds.reduce((sum, id) => {
      const val = parseFloat(participantState[id]?.percentage) || 0;
      return sum + val;
    }, 0);
  }, [selectedParticipantIds, participantState]);

  const toggleParticipant = (uId) => {
    setParticipantState((prev) => ({
      ...prev,
      [uId]: {
        ...prev[uId],
        selected: !prev[uId]?.selected,
      },
    }));
  };

  const handleCustomAmountChange = (uId, val) => {
    setParticipantState((prev) => ({
      ...prev,
      [uId]: {
        ...prev[uId],
        customAmount: val,
      },
    }));
  };

  const handlePercentageChange = (uId, val) => {
    setParticipantState((prev) => ({
      ...prev,
      [uId]: {
        ...prev[uId],
        percentage: val,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide an expense description.');
      return;
    }
    if (numAmount <= 0) {
      setError('Please provide a valid amount greater than zero.');
      return;
    }
    if (!currentGroup) {
      setError('Please select a group.');
      return;
    }
    if (!paidBy) {
      setError('Please select who paid.');
      return;
    }
    if (selectedParticipantIds.length === 0) {
      setError('Please select at least one participant.');
      return;
    }

    // Split validation
    let participantsPayload = [];

    if (splitType === 'equal') {
      participantsPayload = selectedParticipantIds.map((id) => ({
        user: id,
        shareAmount: equalShareAmount,
      }));
    } else if (splitType === 'custom') {
      if (Math.abs(customSplitSum - numAmount) > 0.05) {
        setError(
          `Custom shares sum (₹${customSplitSum.toFixed(2)}) must equal total amount (₹${numAmount.toFixed(2)}).`
        );
        return;
      }
      participantsPayload = selectedParticipantIds.map((id) => ({
        user: id,
        shareAmount: parseFloat(participantState[id]?.customAmount) || 0,
      }));
    } else if (splitType === 'percentage') {
      if (Math.abs(percentageSplitSum - 100) > 0.2) {
        setError(`Percentage split sum must equal 100% (currently ${percentageSplitSum.toFixed(1)}%).`);
        return;
      }
      participantsPayload = selectedParticipantIds.map((id) => {
        const pct = parseFloat(participantState[id]?.percentage) || 0;
        return {
          user: id,
          sharePercentage: pct,
          shareAmount: Number(((pct / 100) * numAmount).toFixed(2)),
        };
      });
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        groupId: currentGroup._id,
        description: description.trim(),
        amount: numAmount,
        paidBy,
        splitType,
        category,
        date,
        participants: participantsPayload,
      };

      let res;
      if (expenseToEdit) {
        res = await api.put(`/expenses/${expenseToEdit._id}`, payload);
      } else {
        res = await api.post('/expenses', payload);
      }

      if (res.success) {
        onClose();
        if (onExpenseSaved) onExpenseSaved(res.expense);
      }
    } catch (err) {
      setError(err.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
      subtitle={currentGroup ? `In group: ${currentGroup.name}` : 'Share a bill with your group'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Group Selector if not locked */}
        {!initialGroup && groups.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Group *
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-white"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.members?.length} members)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner, Uber ride, Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Paid By & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Paid By *
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
            >
              {currentGroup?.members?.map((m) => {
                const u = m.user;
                const uId = (u?._id || u).toString();
                return (
                  <option key={uId} value={uId}>
                    {u?.name || 'Member'} {uId === user?._id?.toString() ? '(You)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.label;
              return (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="truncate w-full text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Type Selector */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Split Type
            </label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
              {['equal', 'custom', 'percentage'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    splitType === type
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time validation summary banner */}
          {splitType === 'equal' && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-medium">
              <span>Divided equally among {selectedParticipantIds.length} members:</span>
              <span className="font-bold text-sm">₹{equalShareAmount} / person</span>
            </div>
          )}

          {splitType === 'custom' && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-medium ${
                Math.abs(customSplitSum - numAmount) <= 0.05
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {Math.abs(customSplitSum - numAmount) <= 0.05 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  Entered: ₹{customSplitSum.toFixed(2)} of ₹{numAmount.toFixed(2)}
                </span>
              </div>
              <span className="font-bold">
                {Math.abs(customSplitSum - numAmount) <= 0.05
                  ? '✓ Balanced'
                  : `₹${Math.abs(numAmount - customSplitSum).toFixed(2)} ${
                      customSplitSum < numAmount ? 'remaining' : 'over'
                    }`}
              </span>
            </div>
          )}

          {splitType === 'percentage' && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-medium ${
                Math.abs(percentageSplitSum - 100) <= 0.2
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {Math.abs(percentageSplitSum - 100) <= 0.2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>Total: {percentageSplitSum.toFixed(1)}% of 100%</span>
              </div>
              <span className="font-bold">
                {Math.abs(percentageSplitSum - 100) <= 0.2
                  ? '✓ Exactly 100%'
                  : `${(100 - percentageSplitSum).toFixed(1)}% needed`}
              </span>
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {currentGroup?.members?.map((m) => {
            const u = m.user;
            const uId = (u?._id || u).toString();
            const isSelected = participantState[uId]?.selected;
            const customVal = participantState[uId]?.customAmount || '';
            const pctVal = participantState[uId]?.percentage || '';

            return (
              <div
                key={uId}
                className={`p-2.5 flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                }`}
              >
                <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={() => toggleParticipant(uId)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {u?.name || 'Member'} {uId === user?._id?.toString() ? '(You)' : ''}
                    </p>
                    <p className="text-[10px] text-slate-400">{u?.email}</p>
                  </div>
                </label>

                {isSelected && (
                  <div className="flex items-center space-x-2">
                    {splitType === 'equal' && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        ₹{equalShareAmount}
                      </span>
                    )}

                    {splitType === 'custom' && (
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customVal}
                          onChange={(e) => handleCustomAmountChange(uId, e.target.value)}
                          className="w-full pl-5 pr-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-right"
                        />
                      </div>
                    )}

                    {splitType === 'percentage' && (
                      <div className="relative w-24">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={pctVal}
                          onChange={(e) => handlePercentageChange(uId, e.target.value)}
                          className="w-full pl-2 pr-5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-right"
                        />
                        <span className="absolute right-2 top-1 text-slate-400 text-xs">%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
