import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { Users, Plus, Trash2, Compass, Home, Briefcase, Heart, PartyPopper, Tag } from 'lucide-react';

const CATEGORIES = [
  { label: 'Trip', icon: Compass },
  { label: 'Flat / Roommates', icon: Home },
  { label: 'Hostel', icon: Briefcase },
  { label: 'Family', icon: Heart },
  { label: 'Party', icon: PartyPopper },
  { label: 'Other', icon: Tag },
];

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [emailInput, setEmailInput] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (memberEmails.includes(trimmed)) {
      setError('This email is already added to the list.');
      return;
    }
    setMemberEmails((prev) => [...prev, trimmed]);
    setEmailInput('');
    setError('');
  };

  const handleRemoveEmail = (index) => {
    setMemberEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.post('/groups', {
        name: name.trim(),
        description: description.trim(),
        category,
        memberEmails,
      });

      if (data.success) {
        // Reset form
        setName('');
        setDescription('');
        setCategory('Trip');
        setMemberEmails([]);
        onClose();
        if (onGroupCreated) onGroupCreated(data.group);
      }
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Expense Group"
      subtitle="Start sharing expenses with friends, roommates, or travel buddies"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Group Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Goa Trip 2026, Flat 402, Dinner Outing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
          />
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.label;
              return (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="What is this group for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
          />
        </div>

        {/* Add Members by Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Invite Members by Email (Optional)
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="friend@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Email Tags List */}
          {memberEmails.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {memberEmails.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(idx)}
                    className="ml-1.5 text-emerald-600 hover:text-emerald-900 focus:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            You can always add or invite more friends later from the group dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
