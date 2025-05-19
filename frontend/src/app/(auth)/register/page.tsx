// auth/register/page.tsx
'use client';


import { AuthService } from '@/services/auth';
import { registerSchema } from '@/schemas/auth';
import { ServerError } from '@/types/auth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { fromZodError } from 'zod-validation-error';
import Link from 'next/link';

const handleServerError = (error: any): ServerError => {
  if (error.name === 'ZodError') {
    const formattedError = fromZodError(error);
    const fieldErrors = formattedError.details.reduce((acc: Record<string, string>, curr) => {
      const fieldName = curr.path[0];
      acc[fieldName] = curr.message;
      return acc;
    }, {});
    return { errors: fieldErrors };
  }

  if (error.message === 'NEXT_REDIRECT') {
    throw error;
  }

  if (error.status === 409) {
    return {
      status: 409,
      detail: 'Username or email is already in use.',
      errors: {
        [error.field]: 'Username or email is already in use.',
      },
    };
  }
  

  return {
    status: 500,
    detail: error.message || 'An error occurred during registration, please try again later',
  };
};

export default function RegisterPage() {
  const handleSubmit = async (prevState: ServerError | null, formData: FormData): Promise<ServerError> => {
    try {
      const rawData = Object.fromEntries(formData.entries());
      const validatedData = registerSchema.parse(rawData);
      await AuthService.register(validatedData);
      
      return {
        status: 200,
        detail: 'Registration successful!',
      };
    } catch (error: any) {
      return handleServerError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Join E-Bank Today <br />
                <span className="text-blue-600">Create Your Free Account</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience seamless banking with our innovative digital solutions.
              </p>
            </div>

            <RegisterForm 
              onSubmit={handleSubmit}
              showSuccessMessage={true}
              autoRedirect={true}
            />

            <div className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 hidden lg:block">
            <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  Why Join E-Bank?
                </h3>
                <ul className="space-y-4 text-left text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Instant account setup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Secure transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Competitive interest rates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
