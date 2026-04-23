import React from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, ShieldCheck, FileText, HelpCircle, GraduationCap } from "lucide-react";
import { fetchMyCourses } from "@/app/actions/student";

export default async function StudentDashboardPage() {
  const myCourses = await fetchMyCourses();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك في منصتك التعليمية 🎓</h1>
        <p className="text-gray-600 text-lg">استكمل رحلة التعلم الخاصة بك، وتذكر أن التميز يبدأ بخطوة.</p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">كورساتي</h2>
        <div className="bg-emerald-50 text-[#0B5C3B] px-4 py-2 rounded-full text-sm font-bold">
          {myCourses.length} مناهج مسجلة
        </div>
      </div>

      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myCourses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
              <div className="h-40 bg-gradient-to-br from-gray-900 to-gray-800 relative p-6 flex flex-col justify-between">
                <div className="bg-white/20 w-fit backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
                  {course.grade}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white line-clamp-2">{course.title}</h3>
                </div>
                
                {/* Play Overlay */}
                <Link href={`/student/course/${course.id}`} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-[#C9A227] flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform">
                    <PlayCircle size={32} />
                  </div>
                </Link>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <BookOpen size={16} className="text-[#0B5C3B]" />
                    <span>يحتوي على {course.itemsCount} درس واختبار</span>
                  </div>
                  
                  {/* Progress Bar (Placeholder) */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-gray-700">نسبة الإنجاز</span>
                      <span className="text-[#0B5C3B]">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#0B5C3B] h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/student/course/${course.id}`}
                  className="w-full text-center bg-gray-50 hover:bg-[#0B5C3B] hover:text-white text-gray-900 py-3 rounded-xl font-bold transition-colors"
                >
                  دخول الغرفة الدراسية
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center">
          <GraduationCap size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">لم تقم بالاشتراك في أي منهج بعد</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
            ابدأ رحلتك التعليمية الآن واكتشف المناهج المتاحة المصممة خصيصاً لك.
          </p>
          <Link href="/courses" className="inline-flex items-center gap-2 bg-[#0B5C3B] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#073b26] transition-colors">
            <BookOpen size={20} /> تصفح الكورسات المتاحة
          </Link>
        </div>
      )}
    </div>
  );
}
