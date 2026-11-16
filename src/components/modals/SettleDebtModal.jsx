import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';

const SettleDebtModal = ({
  isOpen,
  onClose,
  group,
  prefill = null, // { fromUser: { _id, name }, toUser: { _id, name }, amount: number }
  onSettlementRecorded,
}) => {
  const { user } = useAuth();
  const [paidBy, setPaidBy] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (prefill) {
      setPaidBy(prefill.fromUser?._id || '');
      setPaidTo(prefill.toUser?._id || '');
      setAmount(prefill.amount?.toString() || '');
      setNotes('Direct settlement payment');
    } else if (group?.members && group.members.length >= 2) {
      const currentUserId = user?._id?.toString();
      const otherMembers = group.members.filter(
        (m) => (m.user?._id || m.user).toString() !== currentUserId
      );

      setPaidBy(currentUserId || (group.members[0].user?._id || group.members[0].user).toString());
      setPaidTo(
        otherMembers.length > 0
          ? (otherMembers[0].user?._id || otherMembers[0].user).toString()
          : (group.members[1].user?._id || group.members[1].user).toString()
      );
      setAmount('');
      setNotes('');
    }
    setError('');
  }, [isOpen, prefill, group, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!paidBy || !paidTo) {
      setError('Please select both sender and recipient.');
      return;
    }
    if (paidBy === paidTo) {
      setError('Sender and recipient cannot be the same person.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/settlements', {
        groupId: group._id,
        paidBy,
        paidTo,
        amount: numAmount,
        paymentDate,
        notes: notes.trim(),
      });

      if (res.success) {
        onClose();
        if (onSettlementRecorded) {
          onSettlementRecorded(res.settlement, res.updatedBalances);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (uId) => {
    const member = group?.members?.find((m) => (m.user?._id || m.user).toString() === uId);
    return member?.user?.name || 'Member';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record a Settlement"
      subtitle={`Settle debts in "${group?.name}"`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sender -> Recipient visual flow */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800">
          <div className="flex-1 text-center truncate">
            <span className="block text-[10px] uppercase text-emerald-600 font-bold">Payer</span>
            <span className="truncate">{getMemberName(paidBy)}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600 mx-2 flex-shrink-0" />
          <div className="flex-1 text-center truncate">
            <span className="block text-[10px] uppercase text-emerald-600 font-bold">Recipient</span>
            <span className="truncate">{getMemberName(paidTo)}</span>
          </div>
        </div>

        {/* Payer selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Who Paid (Sender) *
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-white"
          >
            {group?.members?.map((m) => {
              const u = m.user;
              const uId = (u?._id || u).toString();
              return (
                <option key={uId} value={uId}>
                  {u?.name} {uId === user?._id?.toString() ? '(You)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Recipient selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Paid To (Recipient) *
          </label>
          <select
            value={paidTo}
            onChange={(e) => setPaidTo(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold bg-white"
          >
            {group?.members?.map((m) => {
              const u = m.user;
              const uId = (u?._id || u).toString();
              return (
                <option key={uId} value={uId}>
                  {u?.name} {uId === user?._id?.toString() ? '(You)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Settlement Amount (₹) *
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

        {/* Date & Payment Method/Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notes / Method
            </label>
            <input
              type="text"
              placeholder="e.g. UPI, GPay, Cash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettleDebtModal;
