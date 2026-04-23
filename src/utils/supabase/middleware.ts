import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth check if environment variables are not set or invalid (for development continuity)
  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.warn("Missing or invalid Supabase config. Skipping Auth Middleware.");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/courses')

  if (!user && !isLoginPage && !isPublicPage && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // RBAC: Check if user is admin or teacher
  if (user && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) {
    // Attempt to fetch profile role
    const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    
    // Fallback to user metadata if profile table isn't created yet or error occurs
    const role = profile?.role || user.user_metadata?.role || 'student';

    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
    const isStudentPath = request.nextUrl.pathname.startsWith('/student');

    if (role === 'student' && isAdminPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }

    if ((role === 'admin' || role === 'teacher') && isStudentPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    if (isLoginPage) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'student' ? '/student' : '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
