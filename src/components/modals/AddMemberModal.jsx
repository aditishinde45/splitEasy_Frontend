import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { Search, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const AddMemberModal = ({ isOpen, onClose, group, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search registered users as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await api.get(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (data.success) {
          // Filter out users already in this group
          const currentMemberIds = group?.members?.map((m) =>
            (m.user?._id || m.user).toString()
          ) || [];
          const filtered = data.users.filter((u) => !currentMemberIds.includes(u._id.toString()));
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, group]);

  const handleAddMember = async (targetEmail) => {
    const finalEmail = targetEmail || email.trim();
    if (!finalEmail) {
      setError('Please provide an email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.post(`/groups/${group._id}/members`, { email: finalEmail });

      if (data.success) {
        setEmail('');
        setSearchQuery('');
        setSearchResults([]);
        onClose();
        if (onMemberAdded) onMemberAdded(data.group);
      }
    } catch (err) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Member"
      subtitle={`Add a registered user to "${group?.name}"`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Direct Email Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Member's Registered Email *
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="e.g. karan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium"
            />
            <button
              type="button"
              disabled={loading || !email.trim()}
              onClick={() => handleAddMember(email)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50 flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Search registered users autocomplete */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Or Search Registered Users
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-medium"
            />
          </div>

          {searching && (
            <p className="text-[11px] text-slate-400 mt-2 text-center animate-pulse">
              Searching registered users...
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMember(u.email)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
