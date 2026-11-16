import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import {
  Users,
  PlusCircle,
  Search,
  Compass,
  Home,
  Briefcase,
  Heart,
  PartyPopper,
  Tag,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_MAP = {
  Trip: { icon: Compass, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Flat / Roommates': { icon: Home, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Hostel: { icon: Briefcase, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  Family: { icon: Heart, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  Party: { icon: PartyPopper, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Other: { icon: Tag, color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/groups');
      if (data.success) {
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const categories = ['All', 'Trip', 'Flat / Roommates', 'Hostel', 'Family', 'Party', 'Other'];

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Expense Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your shared expenses across roommates, trips, and social circles
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center space-x-2 self-start sm:self-center active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Group</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-medium"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <LoadingSpinner text="Loading your groups..." />
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No groups match your search' : 'No groups created yet'}
          description={
            searchTerm
              ? 'Try adjusting your search query or filter.'
              : 'Create your first expense group to start splitting bills.'
          }
          actionText={!searchTerm ? 'Create Group' : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const catInfo = CATEGORY_MAP[group.category] || CATEGORY_MAP.Other;
            const CatIcon = catInfo.icon;

            return (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between hover:border-emerald-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catInfo.color}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{group.category}</span>
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      {group.members?.length || 0} members
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {group.name}
                  </h3>

                  {group.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Member avatars */}
                  <div className="flex -space-x-2 overflow-hidden">
                    {group.members?.slice(0, 4).map((m, idx) => {
                      const u = m.user;
                      return (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                          title={u?.name}
                        >
                          {u?.name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      );
                    })}
                    {group.members?.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={() => {
          fetchGroups();
        }}
      />
    </div>
  );
};

export default GroupsPage;
