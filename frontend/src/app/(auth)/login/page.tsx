import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome Back to E-Bank
            </h1>
            <p className="text-gray-600">
              Securely access your digital banking services
            </p>
          </div>

          {/* لا تمرر onSubmit هنا */}
          <LoginForm />
          
          <div className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
