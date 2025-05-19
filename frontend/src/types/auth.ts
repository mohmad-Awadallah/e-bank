import { IconType } from 'react-icons';

/**
 * نموذج لتمثيل أخطاء السيرفر العامة
 */
export interface ServerError {
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
  data?: any;
}

/**
 * بيانات الدخول
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * بيانات التسجيل
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/**
 * واجهة المستخدم العامة
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

/**
 * نوع مرادف لبيانات المستخدم عند التعاملات
 */
export type UserData = User;

/**
 * حالة المصادقة في التطبيق
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * استجابة تسجيل الدخول
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

/**
 * خصائص حقل النموذج العام
 */
export interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  Icon?: IconType;
  error?: string;
  status?: 'valid' | 'error' | 'checking';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  value: string;
  required?: boolean;
  minLength?: number;
}


/**
 * حساب بنكي
 */
export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
  accountType: 'CURRENT' | 'SAVINGS' | 'LOAN' | 'CREDIT';
  accountName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  active: boolean
}



export interface AuthContextValue extends AuthState {
  login: (creds: { username: string; password: string }) => Promise<UserData>;
  logout: () => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isAuditor: boolean;
  
}
export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REVERSAL';

export interface Transaction {
  id: number;
  amount: number;
  date: string;
  reference: string;
  description?: string;
  accountNumber: string;
  currency: string;
  type: TransactionType;
  status?: string;
}


