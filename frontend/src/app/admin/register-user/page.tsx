// app/admin/register-user/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FormField } from '@/components/common/InputField';
import toast, { Toaster } from 'react-hot-toast';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserTie, FaSpinner, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_AUDITOR';
}

const FORM_FIELDS = [
  { id: 'firstName', label: 'First Name', placeholder: 'Your first name', Icon: FaUserTie, type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', placeholder: 'Your last name', Icon: FaUserTie, type: 'text', required: true },
  { id: 'email', label: 'Email Address', placeholder: 'you@example.com', Icon: FaEnvelope, type: 'email', required: true },
  { id: 'phoneNumber', label: 'Phone Number', placeholder: '050 123 4567', Icon: FaPhone, type: 'tel', required: true },
  { id: 'username', label: 'Username', placeholder: 'Choose a username', Icon: FaUser, type: 'text', required: true },
  { id: 'password', label: 'Password', placeholder: 'Create a password (min 8 chars)', Icon: FaLock, type: 'password', required: true },
];

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pwd: string) =>
  /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(pwd);

const getPasswordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  return Math.min(score, 5);
};

const strengthColor = (s: number) =>
  s <= 2 ? 'bg-red-500' : s <= 3 ? 'bg-yellow-500' : 'bg-green-500';
const strengthText = (s: number) =>
  ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][Math.min(s, 4)];

export default function RegisterUserPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'ROLE_USER',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
    if (name === 'password') {
      const strength = getPasswordStrength(value);
      setPwdStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErr: Record<string, string> = {};

    // Email validation
    if (!validateEmail(data.email)) {
      newErr.email = 'Invalid email format';
      toast.error(newErr.email);
    }
    // Password validation
    if (!validatePassword(data.password)) {
      newErr.password =
        'Password needs 8+ chars, 1 uppercase & 1 special char';
      toast.error(newErr.password);
    }
    // Username length validation
    if (data.username.trim().length < 6) {
      newErr.username = 'Username must be at least 6 characters';
      toast.error(newErr.username);
    }
    // Add further validations if needed (e.g., phone format)

    if (Object.keys(newErr).length) {
      setErrors(newErr);
      return;
    }

    try {
      await register(data);
      setIsSuccess(true);
      setShowSuccessMessage(true);
      toast.success(
        data.role === 'ROLE_ADMIN'
          ? 'Admin registered!'
          : data.role === 'ROLE_AUDITOR'
          ? 'Auditor registered!'
          : 'User registered!'
      );
      setTimeout(() => void router.push('/admin/users'), 3000);
    } catch (err: any) {
      toast.error('Registration failed. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        }} />

      {isSuccess && showSuccessMessage ? (
        <div className="text-center py-20">
          <FaCheckCircle className="text-green-500 text-6xl mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Registration Successful!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your account has been created successfully.
          </p>
          <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {FORM_FIELDS.map(({ id, label, placeholder, Icon, type, required }) => (
            <div key={id} className="space-y-2">
              <FormField
                id={id}
                name={id}
                label={label}
                placeholder={placeholder}
                value={data[id as keyof RegisterFormData]}
                onChange={handleChange}
                type={id === 'password' && showPwd ? 'text' : type}
                error={errors[id]}
                Icon={Icon}
                required={required}
                rightElement={id === 'password' ? (
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                ) : undefined} />
              {id === 'password' && (
                <>
                  <div className="flex gap-1 h-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${i < pwdStrength
                            ? strengthColor(pwdStrength)
                            : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {strengthText(pwdStrength)}
                  </p>
                </>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <label htmlFor="role" className="block font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={data.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="ROLE_USER">User</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_AUDITOR">Auditor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSuccess}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <FaCheckCircle className="text-green-500" /> Registered
              </span>
            ) : (
              'Register User'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
