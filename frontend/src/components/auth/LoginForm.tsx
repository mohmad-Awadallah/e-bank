// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { FaLock, FaUser, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { LoginFormData, loginSchema } from '@/schemas/auth';
import { FormField } from '@/components/common/InputField';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

type LoginErrors = Partial<Record<keyof LoginFormData, string>>;

export const LoginForm = ({ showSuccessToast = true }) => {
  const { login, error: serverError, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [clientErrors, setClientErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = (data: LoginFormData): LoginErrors => {
    try {
      loginSchema.parse(data);
      return {};
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Object.fromEntries(err.errors.map(e => [e.path[0], e.message])) as LoginErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(formData);
    if (Object.keys(errs).length) {
      setClientErrors(errs);
      toast.error('Please fix the errors in the form.');
      return;
    }
    setClientErrors({});
    try {
      const user = await login(formData);
      showSuccessToast && toast.success('Login successful!');
      setTimeout(() => {
        const target = user.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/dashboard';
        if (pathname !== target) router.push(target);
      }, 300);
    } catch {
      serverError && toast.error(serverError);
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff', borderRadius: '8px' } }} />
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField id="username" name="username" label="Username" placeholder="Enter your username" Icon={FaUser} type="text"
          value={formData.username} onChange={handleChange} error={clientErrors.username} />
        <FormField id="password" name="password" label="Password" placeholder="Enter your password" Icon={FaLock}
          type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
          error={clientErrors.password}
          rightElement={<button type="button" onClick={() => setShowPassword(s => !s)}>{showPassword ? <FaEyeSlash/> : <FaEye/>}</button>} />
        {serverError && <p className="text-red-500 text-center">{serverError}</p>}
        <button type="submit" disabled={loading} className={`w-full flex justify-center items-center gap-2 py-3 rounded-lg font-medium text-lg transition-all bg-blue-600 text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
          {loading ? <><FaSpinner className="animate-spin"/> Signing In...</> : 'Sign In'}
        </button>
      </form>
    </>
  );
};