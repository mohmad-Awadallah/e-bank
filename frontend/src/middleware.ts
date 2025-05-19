// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = '0bCXTcIZ+kQx5A3oeueprLfcbBT7pDWxg3oJU+CWn1NFXwftUT+MMFnoS/XO3/2z3yR2KfXqYQ9mqzz7PWhL1w==';
const ADMIN_ROLE = 'ROLE_ADMIN';

interface JwtPayload {
  roles?: string[];
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return new Uint8Array([...binary].map(char => char.charCodeAt(0)));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // تخطي الطلبات الخاصة بـ RSC
  if (search.includes('_rsc=')) return NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;

  // إذا المستخدم مسجّل دخوله وحاول الوصول لصفحات تسجيل/دخول
  if (token && (pathname === '/login' || pathname === '/register')) {
    try {
      const secretKey = base64ToBytes(JWT_SECRET);
      const { payload } = await jwtVerify<JwtPayload>(token, secretKey, { algorithms: ['HS512'] });

      if (payload?.roles?.includes(ADMIN_ROLE)) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (err) {
      console.error('❌ JWT Error during login/register redirection:', err);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }


  // حماية الصفحات الخاصة
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // إذا لم يكن هناك توكن، ارجع للصفحة المناسبة
  if (!token && (isAdminRoute || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      const secretKey = base64ToBytes(JWT_SECRET);
      const { payload } = await jwtVerify<JwtPayload>(token, secretKey, { algorithms: ['HS512'] });

      // حماية صفحة الادمن فقط للمستخدمين الذين لديهم ROLE_ADMIN
      if (isAdminRoute && !payload?.roles?.includes(ADMIN_ROLE)) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // المستخدم العادي يمكنه الوصول إلى /dashboard
      if (isDashboardRoute && !payload?.roles) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

    } catch (err) {
      console.error('❌ JWT Error:', err);
      // توجيه للّوجين إن حصل خطأ في التحقق
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*'
  ],
};
