import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Clock, Activity, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await api.get('/dashboard/recent-activity');
        if (data.success) {
          setActivities(data.activities || []);
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Activity History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete audit trail of all transactions and changes across your groups
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading activity history..." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity recorded yet"
          description="Actions like adding expenses, settlements, and member invites will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft divide-y divide-slate-100">
          {activities.map((act) => (
            <div key={act._id} className="py-4 flex items-start space-x-3.5 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {act.userId?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {act.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {act.groupId && (
                    <Link
                      to={`/groups/${act.groupId._id}`}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
                    >
                      <span>{act.groupId.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  <span className="text-[10px] text-slate-400">
                    • {new Date(act.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
