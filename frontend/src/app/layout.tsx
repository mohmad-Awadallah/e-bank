// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from "@/components/layout/Footer"; 
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4 bg-gray-50">
                <Toaster position="top-center" reverseOrder={false} />
                {/* أضف هنا أي شروط إضافية للتحقق */}
                {children}
              </main>
            </div>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}