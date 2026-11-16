import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import api from '../services/api';

const AppLayout = () => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  const fetchUserGroups = async () => {
    try {
      const data = await api.get('/groups');
      if (data.success) {
        setUserGroups(data.groups || []);
      }
    } catch (err) {
      console.warn('Could not fetch groups for modal:', err);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [isAddExpenseOpen, isCreateGroupOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Outlet />
      </main>

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groups={userGroups}
        onExpenseSaved={() => {
          // Trigger custom event or rely on page reload / navigation
          window.dispatchEvent(new Event('spliteasy:expense_added'));
        }}
      />

      {/* Global Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={() => {
          fetchUserGroups();
        }}
      />
    </div>
  );
};

export default AppLayout;
