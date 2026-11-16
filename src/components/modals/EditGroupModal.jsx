import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { Compass, Home, Briefcase, Heart, PartyPopper, Tag, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { label: 'Trip', icon: Compass },
  { label: 'Flat / Roommates', icon: Home },
  { label: 'Hostel', icon: Briefcase },
  { label: 'Family', icon: Heart },
  { label: 'Party', icon: PartyPopper },
  { label: 'Other', icon: Tag },
];

const EditGroupModal = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group && isOpen) {
      setName(group.name || '');
      setDescription(group.description || '');
      setCategory(group.category || 'Other');
      setError('');
    }
  }, [group, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.put(`/groups/${group._id}`, {
        name: name.trim(),
        description: description.trim(),
        category,
      });

      if (data.success) {
        onClose();
        if (onGroupUpdated) onGroupUpdated(data.group);
      }
    } catch (err) {
      setError(err.message || 'Failed to update group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Group Details"
      subtitle="Update group name, category, or description"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                  className={`flex items-center space-x-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupModal;
