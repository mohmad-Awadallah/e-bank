// app/(dashboard)/create_account/page.tsx

'use client';

import { useState } from 'react';
import { createAccount, AccountCreationInput } from '@/services/account';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FaUser, FaCreditCard, FaSave, FaDollarSign } from 'react-icons/fa';

const ACCOUNT_TYPES = [
  { label: 'Savings', value: 'SAVINGS' },
  { label: 'Current', value: 'CURRENT' },
  { label: 'Fixed Deposit', value: 'FIXED_DEPOSIT' },
  { label: 'Loan', value: 'LOAN' },
  { label: 'Credit', value: 'CREDIT' },
];

const CURRENCIES = [
  { label: 'Saudi Riyal (SAR)', value: 'SAR' },
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
];

export default function CreateAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<AccountCreationInput & { accountNumber: string }>({
    userId: user?.id || '',
    accountType: '',
    accountName: '',
    currency: '',
    accountNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.accountName.trim()) newErrors.accountName = 'Account name is required.';
    if (!form.accountNumber.trim()) newErrors.accountNumber = 'Account number is required.';
    else if (!/^\d{10,}$/.test(form.accountNumber)) newErrors.accountNumber = 'Must be at least 10 digits.';
    if (!form.accountType) newErrors.accountType = 'Select an account type.';
    if (!form.currency) newErrors.currency = 'Select a currency.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('User not authenticated', { position: 'top-center' });
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    try {
      await createAccount(form);
      toast.success('Account created successfully', { position: 'top-center' });
      router.push('/account');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-semibold mb-6">Create New Account</h2>

      <div className="space-y-4">
        {/* Account Name */}
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium mb-1">Account Name</label>
          <div className={`flex items-center border rounded p-2 ${errors.accountName ? 'border-red-500' : ''}`}>
            <FaUser className="mr-2 text-gray-600" />
            <input
              id="accountName"
              value={form.accountName}
              onChange={e => updateField('accountName', e.target.value)}
              className="w-full border-none focus:ring-0"
              placeholder="e.g. Personal Savings"
            />
          </div>
          {errors.accountName && <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>}
        </div>

        {/* Account Number */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">Account Number</label>
          <div className={`flex items-center border rounded p-2 ${errors.accountNumber ? 'border-red-500' : ''}`}>
            <FaCreditCard className="mr-2 text-gray-600" />
            <input
              id="accountNumber"
              value={form.accountNumber}
              onChange={e => updateField('accountNumber', e.target.value)}
              className="w-full border-none focus:ring-0"
              placeholder="Please enter a valid account number"
            />
          </div>
          {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
        </div>

        {/* Account Type */}
        {/* Account Type */}
        <div>
          <label htmlFor="accountType" className="block text-sm font-medium mb-1">Account Type</label>
          <div className={`flex items-center border rounded p-2 ${errors.accountType ? 'border-red-500' : ''}`}>
            <FaSave className="mr-2 text-gray-600" />
            <select
              id="accountType"
              value={form.accountType}
              onChange={e => updateField('accountType', e.target.value)}
              className="w-full border-none focus:ring-0 bg-transparent"
            >
              <option value="" disabled hidden>Select account type</option>
              {ACCOUNT_TYPES.filter(opt => opt.value).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {errors.accountType && <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>}
        </div>


        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium mb-1">Currency</label>
          <div className={`flex items-center border rounded p-2 ${errors.currency ? 'border-red-500' : ''}`}>
            <FaDollarSign className="mr-2 text-gray-600" />
            <select
              id="currency"
              value={form.currency}
              onChange={e => updateField('currency', e.target.value)}
              className="w-full border-none focus:ring-0 bg-transparent"
            >
              <option value="" disabled hidden>Select currency</option>
              {CURRENCIES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
        </div>

      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Account'}
      </button>
    </div>
  );
}
