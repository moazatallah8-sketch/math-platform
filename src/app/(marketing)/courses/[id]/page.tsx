import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Users, PlayCircle, ShieldCheck, CheckCircle, FileText, HelpCircle, Lock } from "lucide-react";
import { fetchCourseDetails } from "@/app/actions/marketing";

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id, 10);
  
  if (isNaN(courseId)) {
    notFound();
  }

  const course = await fetchCourseDetails(courseId);

  if (!course) {
    notFound(); // Will show Next.js 404 page if course is draft or doesn't exist
  }

  // Count items by type
  const videoCount = course.course_items?.filter((i: any) => i.item_type === 'lesson' || i.video_url).length || 0;
  const pdfCount = course.course_items?.filter((i: any) => i.item_type === 'pdf').length || 0;
  const quizCount = course.course_items?.filter((i: any) => i.item_type === 'quiz').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">
      
      {/* Course Hero */}
      <div className="bg-[#0B5C3B] relative overflow-hidden pt-12 pb-24 px-6 text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/courses" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white font-medium mb-8 transition-colors text-sm">
            <ArrowRight size={16} /> تصفح جميع الكورسات
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 font-bold text-sm mb-6">
                {course.grade}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">{course.title}</h1>
              <p className="text-lg text-emerald-100 max-w-2xl leading-relaxed mb-8">
                صُمم هذا المنهج خصيصاً ليأخذ بيدك خطوة بخطوة نحو التميز. شروحات مفصلة، وملفات مساعدة، واختبارات لتقييم مستواك أولاً بأول.
              </p>
              
              <div className="flex items-center gap-8 text-emerald-50">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-[#C9A227]" />
                  <span className="font-medium">{course.students_count} طالب مسجل</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={20} className="text-[#C9A227]" />
                  <span className="font-medium">{videoCount} درس فيديو</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#C9A227]" />
                  <span className="font-medium">تحديث مستمر</span>
                </div>
              </div>
            </div>

            {/* Sticky Enrollment Card */}
            <div className="w-full lg:w-[400px] bg-white rounded-3xl p-8 shadow-2xl text-gray-900 border border-gray-100 lg:-mb-32 relative z-20">
              <div className="text-center mb-6 border-b border-gray-100 pb-6">
                <p className="text-sm text-gray-500 font-medium mb-2">استثمر في مستقبلك</p>
                <div className="text-5xl font-black text-[#0B5C3B]">
                  {course.price > 0 ? `${course.price} ريال` : 'مجانًا'}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#0B5C3B] shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium text-sm">وصول غير محدود لجميع الفيديوهات</span>
                </li>
                {pdfCount > 0 && (
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#0B5C3B] shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium text-sm">تحميل مذكرات الـ PDF المرفقة</span>
                  </li>
                )}
                {quizCount > 0 && (
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#0B5C3B] shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium text-sm">حل الاختبارات التجريبية وتصحيح آلي</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#0B5C3B] shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium text-sm">متابعة مباشرة من المعلم</span>
                </li>
              </ul>
              
              {/* To do: link to checkout logic if student, or login if visitor */}
              <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-[#C9A227] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#b08d22] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                <Lock size={18} /> اشترك الآن وابدأ التعلم
              </Link>
              <p className="text-center text-xs text-gray-400 mt-4">بمجرد الاشتراك، ستحصل على صلاحية فورية للمنصة.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus / Content Section */}
      <div className="max-w-6xl mx-auto px-6 mt-16 lg:mt-24">
        <div className="w-full lg:w-[calc(100%-448px)] pr-0">
          <h2 className="text-3xl font-black text-gray-900 mb-8">محتوى المنهج الدراسي</h2>
          
          {course.course_items && course.course_items.length > 0 ? (
            <div className="space-y-4">
              {course.course_items.map((item: any, index: number) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#0B5C3B]/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    {item.item_type === 'lesson' || item.video_url ? (
                      <PlayCircle size={24} className="text-blue-500" />
                    ) : item.item_type === 'pdf' ? (
                      <FileText size={24} className="text-red-500" />
                    ) : item.item_type === 'quiz' ? (
                      <HelpCircle size={24} className="text-purple-500" />
                    ) : (
                      <BookOpen size={24} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      {item.item_type === 'lesson' || item.video_url ? 'درس فيديو' : item.item_type === 'pdf' ? 'ملف PDF' : 'اختبار إلكتروني'}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">مغلق</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">جاري تجهيز محتوى المنهج</h3>
              <p className="text-gray-500">سيتم إضافة الدروس والاختبارات قريباً.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
