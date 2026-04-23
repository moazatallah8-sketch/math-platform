import React from "react";
import Link from "next/link";
import { BookOpen, Users, PlayCircle, Search, ArrowRight } from "lucide-react";
import { fetchActiveCourses } from "@/app/actions/marketing";

export default async function CoursesPage() {
  const courses = await fetchActiveCourses(); // fetch all active courses

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0B5C3B] font-medium mb-6 transition-colors">
            <ArrowRight size={18} /> العودة للرئيسية
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">المناهج الدراسية الكورسات</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            تصفح جميع المناهج المتاحة واختر الكورس المناسب لمستواك الدراسي. جميع الكورسات مصممة بعناية وتتضمن شروحات فيديو واختبارات تفاعلية.
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0B5C3B]/80 to-[#073b26] flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
                    <BookOpen size={40} className="text-white opacity-80" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B5C3B] shadow-sm">
                    {course.grade}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0B5C3B] transition-colors">{course.title}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span>{course.students_count} طالب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PlayCircle size={14} />
                      <span>شامل الفيديوهات</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xl font-black text-[#C9A227]">
                      {course.price > 0 ? `${course.price} ريال` : 'مجانًا'}
                    </div>
                    <Link 
                      href={`/courses/${course.id}`}
                      className="bg-gray-50 text-gray-900 hover:bg-[#0B5C3B] hover:text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm"
                    >
                      التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد مناهج نشطة حالياً</h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              لا يزال المعلم يقوم بتجهيز المحتوى. يرجى العودة لاحقاً لاستكشاف الكورسات الجديدة!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
