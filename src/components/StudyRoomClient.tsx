"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, FileText, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";
import { recordVideoDropoff, recordQuizAttempt } from "@/app/actions/student";

function getYoutubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?rel=0` : null;
}

export default function StudyRoomClient({ course }: { course: any }) {
  const [activeItem, setActiveItem] = useState<any>(course.course_items?.[0] || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Video Tracking
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleVideoPause = () => {
    if (videoRef.current && activeItem) {
      const currentMinute = Math.floor(videoRef.current.currentTime / 60);
      recordVideoDropoff(activeItem.id, currentMinute);
    }
  };

  // Quiz Engine State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);

  // Reset quiz state when active item changes
  useEffect(() => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
    setShowFeedback(null);
  }, [activeItem]);

  const handleQuizSubmit = async () => {
    if (selectedOption === null || !activeItem || !activeItem.questions) return;
    
    const currentQ = activeItem.questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQ.correct_index;
    
    // Tracking
    await recordQuizAttempt(currentQ.id, isCorrect);

    if (isCorrect) setQuizScore(s => s + 1);
    setShowFeedback(isCorrect);

    setTimeout(() => {
      if (currentQuestionIdx < activeItem.questions.length - 1) {
        setCurrentQuestionIdx(idx => idx + 1);
        setSelectedOption(null);
        setShowFeedback(null);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  if (!course.course_items || course.course_items.length === 0) {
    return <div className="p-12 text-center">لا توجد محتويات لهذا الكورس بعد.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50" dir="rtl">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0`}>
        <div className="p-6 border-b border-gray-100">
          <Link href="/student" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0B5C3B] mb-4">
            <ArrowRight size={16} /> العودة للكورسات
          </Link>
          <h2 className="font-bold text-lg text-gray-900">{course.title}</h2>
        </div>
        <div className="p-4 space-y-2">
          {course.course_items.map((item: any, idx: number) => {
            const isActive = activeItem?.id === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors ${
                  isActive ? 'bg-[#0B5C3B] text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {item.item_type === 'lesson' || item.video_url ? (
                  <PlayCircle size={18} className={isActive ? 'text-emerald-300' : 'text-[#0B5C3B]'} />
                ) : item.item_type === 'pdf' ? (
                  <FileText size={18} className={isActive ? 'text-emerald-300' : 'text-red-500'} />
                ) : (
                  <HelpCircle size={18} className={isActive ? 'text-emerald-300' : 'text-purple-500'} />
                )}
                <div className="flex-1 truncate">
                  <span className="text-sm font-bold block truncate">{idx + 1}. {item.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 z-10 bg-white border border-gray-200 p-2 rounded-lg shadow-sm text-gray-600 hover:text-[#0B5C3B]"
        >
          {isSidebarOpen ? 'إخفاء الفهرس' : 'إظهار الفهرس'}
        </button>

        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8">{activeItem.title}</h1>

          {/* Render Video */}
          {(activeItem.item_type === 'lesson' || activeItem.video_url) && (
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative">
              {activeItem.video_url ? (
                getYoutubeEmbedUrl(activeItem.video_url) ? (
                  <iframe 
                    src={getYoutubeEmbedUrl(activeItem.video_url) as string} 
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                ) : (
                  <video 
                    ref={videoRef}
                    src={activeItem.video_url.includes('http') ? activeItem.video_url : undefined} 
                    controls 
                    className="w-full h-full"
                    onPause={handleVideoPause}
                    poster="https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca9?q=80&w=2000&auto=format&fit=crop"
                  />
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full text-white/50">
                  لا يوجد رابط فيديو
                </div>
              )}
            </div>
          )}

          {/* Render PDF */}
          {activeItem.item_type === 'pdf' && (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm text-center">
              <FileText size={64} className="mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">ملف المذكرة المرفقة</h3>
              <p className="text-gray-500 mb-6">يحتوي هذا الدرس على ملف PDF يمكنك تحميله وطباعته.</p>
              {activeItem.pdf_url ? (
                <a href={activeItem.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#0B5C3B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#073b26] transition-colors">
                  تحميل الملف <ArrowRight size={18} className="rotate-180" />
                </a>
              ) : (
                <span className="text-gray-400">لا يوجد رابط للملف</span>
              )}
            </div>
          )}

          {/* Render Quiz Engine */}
          {activeItem.item_type === 'quiz' && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="bg-purple-600 p-6 text-white text-center">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-black">اختبار: {activeItem.title}</h2>
              </div>
              
              {!activeItem.questions || activeItem.questions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">لا توجد أسئلة في هذا الاختبار.</div>
              ) : quizFinished ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} className="text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">اكتمل الاختبار!</h3>
                  <p className="text-xl text-gray-600 mb-8">لقد أجبت بشكل صحيح على <strong className="text-[#0B5C3B]">{quizScore}</strong> من أصل <strong className="text-gray-900">{activeItem.questions.length}</strong> سؤال.</p>
                  <button onClick={() => {
                    setCurrentQuestionIdx(0); setQuizScore(0); setQuizFinished(false);
                  }} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    إعادة الاختبار
                  </button>
                </div>
              ) : (
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-8 text-sm font-bold text-gray-500">
                    <span>السؤال {currentQuestionIdx + 1} من {activeItem.questions.length}</span>
                    <span>النتيجة: {quizScore}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                    {activeItem.questions[currentQuestionIdx].content}
                  </h3>

                  <div className="space-y-4">
                    {Array.isArray(activeItem.questions[currentQuestionIdx].options) && activeItem.questions[currentQuestionIdx].options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        disabled={showFeedback !== null}
                        className={`w-full text-right p-5 rounded-2xl border-2 transition-all duration-300 font-bold text-lg ${
                          selectedOption === idx 
                            ? 'border-purple-600 bg-purple-50 text-purple-900' 
                            : 'border-gray-200 hover:border-purple-300 text-gray-700 bg-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {showFeedback !== null && (
                    <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 font-bold text-lg animate-in fade-in zoom-in duration-300 ${showFeedback ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {showFeedback ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                      {showFeedback ? 'إجابة صحيحة! أحسنت' : 'إجابة خاطئة، حاول التركيز أكثر.'}
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={selectedOption === null || showFeedback !== null}
                      className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      تأكيد الإجابة
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
