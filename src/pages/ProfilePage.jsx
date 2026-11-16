import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setNameLoading(true);
      setNameError('');
      setNameSuccess('');
      const data = await api.put('/users/profile', { name, profilePicture });
      if (data.success) {
        updateUser(data.user);
        setNameSuccess('Profile details updated successfully.');
      }
    } catch (err) {
      setNameError(err.message || 'Failed to update profile.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setPwdLoading(true);
      setPwdError('');
      setPwdSuccess('');
      const data = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (data.success) {
        setPwdSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and account security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: User Info Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-emerald ring-4 ring-emerald-50 mb-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold">Account Status</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold">Member Since</span>
              <span className="text-slate-800 font-semibold">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString([], {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right cards: Edit Profile & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
            <h3 className="text-base font-bold text-slate-900 mb-1">Personal Details</h3>
            <p className="text-xs text-slate-400 mb-4">Update your display name</p>

            {nameSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{nameSuccess}</span>
              </div>
            )}
            {nameError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{nameError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={nameLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {nameLoading ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft">
            <h3 className="text-base font-bold text-slate-900 mb-1">Security & Password</h3>
            <p className="text-xs text-slate-400 mb-4">Ensure your account is protected</p>

            {pwdSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{pwdSuccess}</span>
              </div>
            )}
            {pwdError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  {pwdLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
