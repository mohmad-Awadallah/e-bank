// contexts/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { api, User } from '../services/apiService';



interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email: string, firstName: string, lastName: string, phoneNumber: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // عند تشغيل التطبيق: جلب المستخدم الحالي إذا كانت الكوكيز موجودة
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.getCurrentUser(); // GET /auth/me
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // تسجيل الدخول الفعلي عبر API
    const login = async (username: string, password: string) => {
        try {
            await api.login({ username, password }); // POST /auth/login
            const res = await api.getCurrentUser(); // إعادة جلب المستخدم بعد تسجيل الدخول
            setUser(res.data);
        } catch (err) {
            setUser(null);
            throw err;
        }
    };

    // تسجيل الخروج
    const logout = async () => {
        try {
            await api.logout(); // POST /auth/logout
        } catch { }
        setUser(null);
    };

    // تسجيل مستخدم جديد عبر API
    const register = async (username: string, password: string, email: string, firstName: string, lastName: string, phoneNumber: string) => {
        try {
            await api.register({ username, password, email, firstName, lastName, phoneNumber });
        } catch (err) {
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                login,
                register,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook للاستخدام داخل المكونات
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
