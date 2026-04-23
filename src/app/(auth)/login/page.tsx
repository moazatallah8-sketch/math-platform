"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, Mail, AlertCircle, User as UserIcon } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'unauthorized') {
        setError("غير مصرح لك بالدخول. يتطلب حسابك صلاحيات خاصة.");
        window.history.replaceState({}, document.title, "/login");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (isLogin) {
      // عملية تسجيل الدخول
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      // عملية إنشاء حساب جديد (طالب)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'student' // الحسابات الجديدة للطلاب افتراضياً
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
      } else {
        setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {isLogin ? "تسجيل الدخول للمنصة" : "إنشاء حساب جديد"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "مرحباً بك مجدداً في منصتك التعليمية" : "ابدأ رحلة التفوق معنا بخطوات بسيطة"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#18181b] py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-800">
          
          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-[#0B5C3B] text-[#0B5C3B] dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              تسجيل دخول
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-[#0B5C3B] text-[#0B5C3B] dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              حساب جديد
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الاسم الرباعي
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B5C3B] focus:border-transparent outline-none transition-all"
                    placeholder="أدخل اسمك كاملاً"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B5C3B] focus:border-transparent outline-none transition-all"
                  placeholder="student@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0B5C3B] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#0B5C3B] focus:ring-[#0B5C3B] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    تذكرني
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[#0B5C3B] hover:text-[#073b26] transition-colors">
                    نسيت كلمة المرور؟
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0B5C3B] hover:bg-[#073b26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B5C3B] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> {isLogin ? "جاري التحقق..." : "جاري الإنشاء..."}
                  </span>
                ) : (
                  isLogin ? "تسجيل الدخول" : "إنشاء حساب"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
