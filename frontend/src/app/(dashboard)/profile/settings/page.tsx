// app/(dashboard)/settings/page.tsx

'use client';

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/user';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FaLock,
  FaCheck,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

// Validators
const validatePassword = (pwd: string) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(pwd);
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[0-9()+-\s]*$/.test(phone);

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile fields
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="p-6 text-center">
        <p>❌ You must be logged in to access settings.</p>
        <Link href="/login" className="text-blue-600 underline mt-4 inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Please enter your current password');
    if (!validatePassword(newPassword)) return toast.error('Password must be ≥8 chars, include uppercase & special char');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');

    try {
      setLoading(true);
      await userService.changePassword(Number(user.id), currentPassword, newPassword);
      toast.success('Password changed successfully', { icon: <FaCheck /> });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      const status = error?.response?.status;
      if (status === 400) toast.error('Incorrect current password');
      else if (status === 500) toast.error('Current password is incorrect');
      else toast.error('Error changing password');
    } finally { setLoading(false); }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return toast.error('Invalid email address');
    if (phoneNumber && !validatePhone(phoneNumber)) return toast.error('Invalid phone number');

    try {
      setLoading(true);
      await userService.updateUser(Number(user.id), { email, phoneNumber });
      toast.success('Profile updated successfully', { icon: <FaCheck /> });
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-12">
      <Link href="/dashboard" className="flex items-center text-gray-600 hover:underline">
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>

      {/* Change Password */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaLock className="mr-2" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { value: currentPassword, show: showCurrent, setShow: setShowCurrent, setValue: setCurrentPassword, placeholder: 'Current Password' },
            { value: newPassword, show: showNew, setShow: setShowNew, setValue: setNewPassword, placeholder: 'New Password' },
            { value: confirmPassword, show: showConfirm, setShow: setShowConfirm, setValue: setConfirmPassword, placeholder: 'Confirm Password' },
          ].map((field, idx) => (
            <div className="flex items-center border px-3 py-2 rounded relative" key={idx}>
              <FaLock className="mr-2 text-gray-500" />
              <input
                type={field.show ? 'text' : 'password'}
                className="flex-1 focus:outline-none"
                placeholder={field.placeholder}
                value={field.value}
                onChange={e => field.setValue(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-gray-500"
                onClick={() => field.setShow(prev => !prev)}
              >
                {field.show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processing...' : 'Change Password'}
          </button>
        </form>
      </section>

      {/* Profile Settings */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaEnvelope className="mr-2" /> Profile Settings
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex items-center border px-3 py-2 rounded">
            <FaEnvelope className="mr-2 text-gray-500" />
            <input
              type="email"
              className="flex-1 focus:outline-none"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center border px-3 py-2 rounded">
            <FaPhone className="mr-2 text-gray-500" />
            <input
              type="tel"
              className="flex-1 focus:outline-none"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Processing...' : 'Update Profile'}
          </button>
        </form>
      </section>
    </div>
  );
}
