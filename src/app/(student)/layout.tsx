import React from "react";
import Link from "next/link";
import { BookOpen, LogOut, User } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const profileName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "طالب";

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans selection:bg-[#0B5C3B] selection:text-white" dir="rtl">
      {/* Student Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/student" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#0B5C3B] flex items-center justify-center text-[#C9A227] font-black text-sm shadow-md">
              ∑
            </div>
            <span className="font-bold text-lg text-gray-900">
              رياضيات<span className="text-[#0B5C3B]">+</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#0B5C3B] transition-colors flex items-center gap-1.5">
              الرئيسية
            </Link>
            <Link href="/courses" className="text-sm font-bold text-gray-600 hover:text-[#0B5C3B] transition-colors flex items-center gap-1.5 border-l border-gray-200 pl-6">
              <BookOpen size={16} /> تصفح المزيد
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {profileName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-gray-900 leading-none">{profileName}</p>
                <p className="text-xs text-gray-500 mt-1">طالب</p>
              </div>
            </div>

            <form action="/auth/signout" method="POST">
              <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                <LogOut size={18} />
              </button>
            </form>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
