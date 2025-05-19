// app/components/auth/RegisterForm.tsx
'use client';

import { useActionState, useState, useEffect, startTransition } from 'react';
import { FormField } from '@/components/common/InputField';
import { ServerError } from '@/types/auth';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FaUser, FaLock, FaEnvelope, FaPhone, FaUserTie,
  FaSpinner, FaEye, FaEyeSlash, FaCheckCircle
} from 'react-icons/fa';

interface RegisterFormProps {
  onSubmit: (prevState: ServerError | null, formData: FormData) => Promise<ServerError>;
  showSuccessMessage?: boolean;
  autoRedirect?: boolean;
  redirectUrl?: string;
  redirectDelay?: number;
  onSuccess?: () => void;
}

const FORM_FIELDS = [
  { id: 'firstName', name: 'firstName', label: 'First Name', placeholder: 'Your first name', Icon: FaUserTie, type: 'text', gridClass: 'md:col-span-1', required: true },
  { id: 'lastName', name: 'lastName', label: 'Last Name', placeholder: 'Your last name', Icon: FaUserTie, type: 'text', gridClass: 'md:col-span-1', required: true },
  { id: 'email', name: 'email', label: 'Email Address', placeholder: 'your@email.com', Icon: FaEnvelope, type: 'email', gridClass: 'md:col-span-2', required: true, pattern: '[^@\\s]+@[^@\\s]+\\.[^@\\s]+' },
  { id: 'phoneNumber', name: 'phoneNumber', label: 'Phone Number', placeholder: '050 123 4567', Icon: FaPhone, type: 'tel', gridClass: 'md:col-span-2', required: true },
  { id: 'username', name: 'username', label: 'Username', placeholder: 'Choose a username', Icon: FaUser, type: 'text', gridClass: 'md:col-span-2', required: true, minLength: 4 },
  { id: 'password', name: 'password', label: 'Password', placeholder: 'Create a password (min 8 chars)', Icon: FaLock, type: 'password', gridClass: 'md:col-span-2', required: true, minLength: 8 },
];

export const RegisterForm = ({
  onSubmit,
  showSuccessMessage = true,
  autoRedirect = true,
  redirectUrl = '/login',
  redirectDelay = 3000,
  onSuccess
}: RegisterFormProps) => {
  const [state, formAction, isPending] = useActionState(onSubmit, null);
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Controlled form state
  const [formValues, setFormValues] = useState<Record<string, string>>( 
    FORM_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
  );

  // General change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (id === 'password') setPasswordStrength(getPasswordStrength(value));
  };

  const validatePassword = (password: string) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
  const validateEmail = (email: string) => /^[^\s@]+@[^@\s]+\.[^@\s]+$/.test(email);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][Math.min(strength, 4)];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    FORM_FIELDS.forEach(({ id, required }) => {
      const value = formValues[id] || '';
      if (required && !value.trim()) errors[id] = 'This field is required';
      if (id === 'email' && !validateEmail(value)) errors[id] = 'Invalid email format';
      if (id === 'password' && !validatePassword(value)) errors[id] = 'Must contain: 8+ chars, 1 uppercase, 1 symbol';
    });

    if (Object.keys(errors).length) {
      setClientErrors(errors);
      toast.error('Please fix all form errors');
      return;
    }

    const formData = new FormData();
    Object.entries(formValues).forEach(([key, val]) => formData.append(key, val));
    startTransition(() => formAction(formData));
  };

  useEffect(() => {
    if (!state) return;

    if (state.status === 409 || state.status === 500) {
      toast.error(state.detail || 'Registration failed. Please try again.');
    } else if (state.status === 200) {
      setIsSuccess(true);
      if (showSuccessMessage) toast.success('Registration successful!');
      onSuccess?.();
      if (autoRedirect) {
        const timer = setTimeout(() => router.push(redirectUrl), redirectDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [state, router, showSuccessMessage, autoRedirect, redirectUrl, redirectDelay, onSuccess]);

  const getFieldError = (fieldName: string) => clientErrors[fieldName] || state?.errors?.[fieldName];

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff', padding: '16px', borderRadius: '8px' },
          success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
        }}
      />

      {isSuccess && showSuccessMessage ? (
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-green-500 text-6xl mb-6"><FaCheckCircle /></div>
          <h2 className="text-3xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Your account has been created successfully.
            {autoRedirect && " You'll be redirected shortly."}
          </p>
          {autoRedirect && (
            <div className="flex justify-center">
              <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-label="Registration Form"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_FIELDS.map((field) => {
              const error = getFieldError(field.id);
              const isPasswordField = field.id === 'password';

              return (
                <div key={field.id} className={field.gridClass}>
                  <FormField
                    {...field}
                    value={formValues[field.id]}
                    onChange={handleChange}
                    error={error}
                    type={isPasswordField ? (showPassword ? 'text' : 'password') : field.type}
                    rightElement={isPasswordField && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  />
                  {isPasswordField && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-1 text-gray-500">{getStrengthText(passwordStrength)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {state?.detail && (
            <div role="alert" className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {state.detail.includes('Registration failed') ? 'Registration failed' : state.detail}
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg transition-colors ${
              isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isPending}
            aria-live="polite"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      )}
    </>
  );
};
