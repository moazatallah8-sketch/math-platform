import React from "react";
import Link from "next/link";
import { BookOpen, LogIn, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Determine dashboard link based on role
  let dashboardLink = "/login";
  let ctaText = "تسجيل الدخول";
  
  if (session) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = profile?.role || session.user.user_metadata?.role || 'student';
    dashboardLink = (role === 'admin' || role === 'teacher') ? '/admin' : '/student';
    ctaText = "العودة للمنصة";
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-[#0B5C3B] selection:text-white" dir="rtl">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B5C3B] to-[#073b26] flex items-center justify-center text-[#C9A227] font-black text-xl shadow-lg transform group-hover:scale-105 transition-transform">
              ∑
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              رياضيات<span className="text-[#0B5C3B]">+</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-semibold text-gray-600">
            <Link href="/" className="hover:text-[#0B5C3B] transition-colors">الرئيسية</Link>
            <Link href="/courses" className="hover:text-[#0B5C3B] transition-colors">المناهج والكورسات</Link>
            <a href="#about" className="hover:text-[#0B5C3B] transition-colors">عن المنصة</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={dashboardLink}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0B5C3B] rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              {session ? <BookOpen size={18} /> : <LogIn size={18} />}
              <span>{ctaText}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#09090b] text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B5C3B] to-[#073b26] flex items-center justify-center text-[#C9A227] font-black text-lg">
                ∑
              </div>
              <span className="font-extrabold text-xl text-white">
                رياضيات<span className="text-[#0B5C3B]">+</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              المنصة التعليمية الأولى لتأسيس وتقديم شروحات الرياضيات للمرحلة الثانوية والجامعية بأساليب تفاعلية حديثة.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[#C9A227] transition-colors">الرئيسية</Link></li>
              <li><Link href="/courses" className="hover:text-[#C9A227] transition-colors">استكشف الكورسات</Link></li>
              <li><Link href="/login" className="hover:text-[#C9A227] transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm">
              <li>البريد: support@mathplus.com</li>
              <li>الواتساب: +966 50 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p>© {new Date().getFullYear()} منصة رياضيات+. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
