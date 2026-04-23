import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Users, Star, PlayCircle, ShieldCheck } from "lucide-react";
import { fetchMarketingStats, fetchActiveCourses } from "@/app/actions/marketing";

export default async function MarketingHomePage() {
  const stats = await fetchMarketingStats();
  const latestCourses = await fetchActiveCourses(3);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0B5C3B]/10 to-[#C9A227]/10 blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#0B5C3B]/5 to-transparent blur-3xl z-0 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#0B5C3B] font-bold text-sm shadow-sm">
                <Star size={16} className="text-[#C9A227] fill-[#C9A227]" />
                المنصة الأولى لتعلم الرياضيات
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.2]">
                أتقن <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B5C3B] to-[#159a65]">الرياضيات</span> <br/>
                بأسلوب يضمن لك <span className="relative whitespace-nowrap">
                  <span className="relative z-10">التفوق</span>
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#C9A227]/40" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="8" fill="none"/></svg>
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg font-medium">
                شروحات مبسطة، تدريبات تفاعلية، واختبارات تحاكي الامتحانات الحقيقية. ابدأ رحلتك نحو العلامة الكاملة الآن مع نخبة من المعلمين الخبراء.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/courses" className="group flex items-center gap-2 bg-[#0B5C3B] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#073b26] transition-all hover:shadow-[0_8px_30px_rgb(11,92,59,0.3)] hover:-translate-y-1">
                  استكشف المناهج
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link href="#how-it-works" className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">
                  <PlayCircle size={20} className="text-[#0B5C3B]" />
                  كيف تعمل المنصة؟
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#0B5C3B]">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-xl text-gray-900">+{stats.studentsCount}</p>
                    <p className="text-sm text-gray-500 font-medium">طالب مسجل</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-[#C9A227]">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="font-black text-xl text-gray-900">{stats.coursesCount}</p>
                    <p className="text-sm text-gray-500 font-medium">كورس نشط</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual/Image Element */}
            <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                <Image 
                  src="https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca9?q=80&w=2000&auto=format&fit=crop" 
                  alt="طالب يدرس الرياضيات" 
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Floating Card */}
                <div className="absolute bottom-6 right-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
                  <div className="w-12 h-12 rounded-full bg-[#0B5C3B] flex items-center justify-center text-white shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">محتوى معتمد وموثوق</h3>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">مطابق لأحدث معايير المناهج الدراسية</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">أحدث المناهج المضافة</h2>
              <p className="text-gray-600 max-w-2xl text-lg">كورسات مصممة بعناية لتناسب مستواك وتأخذ بيدك خطوة بخطوة نحو التميز.</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-2 text-[#0B5C3B] font-bold hover:text-[#073b26] transition-colors group">
              عرض جميع الكورسات
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          {latestCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestCourses.map((course: any) => (
                <div key={course.id} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {/* Placeholder for course image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B5C3B]/80 to-[#073b26] flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-500">
                      <div className="text-white text-center">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-80" />
                        <h3 className="font-bold text-xl line-clamp-2">{course.title}</h3>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B5C3B] shadow-sm">
                      {course.grade}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0B5C3B] transition-colors">{course.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-6 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} />
                        <span>{course.students_count} طالب</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PlayCircle size={16} />
                        <span>شامل الفيديوهات</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-black text-[#C9A227]">
                        {course.price > 0 ? `${course.price} ريال` : 'مجانًا'}
                      </div>
                      <Link 
                        href={`/courses/${course.id}`}
                        className="bg-gray-50 text-gray-900 hover:bg-[#0B5C3B] hover:text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">قريباً سيتم إضافة المناهج</h3>
              <p className="text-gray-500">المعلم يقوم حالياً بتجهيز المحتوى بأفضل صورة ممكنة.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
