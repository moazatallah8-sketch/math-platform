"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge
} from "@tremor/react";
import { Plus, Edit2, Trash2, Search, Video, FileText, CheckSquare, BookOpen, ChevronRight, Save, LayoutList, X, Image as ImageIcon, Type, HelpCircle, FileDown, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { fetchCourses, saveCourseFull, deleteCourse } from "@/lib/db";

// Mock Data
const initialCourses = [
  { id: 1, title: "التفاضل والتكامل (ثالث ثانوي)", grade: "الصف الثالث الثانوي", students: 450, status: "نشط", price: 150, lastUpdated: "2024-05-12", items: [] },
  { id: 2, title: "الجبر وأساسياته", grade: "القدرات العامة", students: 380, status: "نشط", price: 120, lastUpdated: "2024-05-10", items: [] },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [uploadingState, setUploadingState] = useState<string | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCourses();
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(initialCourses); // Fallback if DB is empty/not setup
        }
      } catch (e) {
        setCourses(initialCourses);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);
  
  // View State: 'list' | 'builder'
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  // Create Course Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseGrade, setNewCourseGrade] = useState("القدرات العامة");

  // Filtered Courses
  const filteredCourses = courses.filter(c => c.title.includes(search));
  
  // Active Course for Builder
  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Handlers for List View
  const handleOpenCreateModal = () => {
    setNewCourseTitle("");
    setNewCourseGrade("القدرات العامة");
    setCreateModalOpen(true);
  };

  const handleConfirmCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    
    const newCourse = {
      id: Date.now(),
      title: newCourseTitle,
      grade: newCourseGrade,
      price: 0,
      status: "نشط", // Default to active so it shows up
      students: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      items: []
    };
    setCourses([newCourse, ...courses]);
    setCreateModalOpen(false);
  };

  const handleDeleteCourse = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الكورس نهائياً؟")) {
      try {
        // If it's a real DB ID (not a large timestamp)
        if (id < 1000000000) await deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveCourse = async () => {
    if (!activeCourse) return;
    setIsSaving(true);
    setDbError(null);
    try {
      await saveCourseFull(activeCourse);
      alert('تم الحفظ بنجاح!');
      setView('list');
      // Refresh list
      const data = await fetchCourses();
      if (data && data.length > 0) setCourses(data);
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openBuilder = (id: number) => {
    setActiveCourseId(id);
    setView('builder');
  };

  const updateCourseInfo = (field: string, value: any) => {
    if (!activeCourseId) return;
    setCourses(courses.map(c => 
      c.id === activeCourseId ? { ...c, [field]: value } : c
    ));
  };

  // Handlers for Builder View
  const handleAddItem = (type: 'lesson' | 'quiz' | 'pdf') => {
    if (!activeCourse) return;
    const titles = {
      lesson: "درس جديد (شرح)",
      quiz: "اختبار / واجب جديد",
      pdf: "مذكرة / ملف PDF"
    };
    const newItem = {
      id: Date.now(),
      type,
      title: titles[type],
      videoUrl: "",
      pdfUrl: "",
      questions: []
    };
    const updatedCourses = courses.map(c => 
      c.id === activeCourse.id ? { ...c, items: [...(c.items || []), newItem] } : c
    );
    setCourses(updatedCourses);
  };

  const updateItem = (itemId: number, field: string, value: any) => {
    if (!activeCourse) return;
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          items: c.items.map((l: any) => l.id === itemId ? { ...l, [field]: value } : l)
        };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  const deleteItem = (itemId: number) => {
    if (!activeCourse) return;
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return { ...c, items: c.items.filter((l: any) => l.id !== itemId) };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  // Question Handlers
  const addQuestion = (itemId: number) => {
    if (!activeCourse) return;
    const newQuestion = {
      id: Date.now(),
      type: 'text', // 'text' | 'image'
      content: "",
      options: ["", "", "", ""],
      correctIndex: 0
    };
    
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          items: c.items.map((l: any) => l.id === itemId ? { ...l, questions: [...(l.questions || []), newQuestion] } : l)
        };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  const updateQuestion = (itemId: number, questionId: number, field: string, value: any) => {
    if (!activeCourse) return;
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          items: c.items.map((l: any) => {
            if (l.id === itemId) {
              return {
                ...l,
                questions: l.questions.map((q: any) => q.id === questionId ? { ...q, [field]: value } : q)
              };
            }
            return l;
          })
        };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  const updateQuestionOption = (itemId: number, questionId: number, optionIndex: number, value: string) => {
    if (!activeCourse) return;
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          items: c.items.map((l: any) => {
            if (l.id === itemId) {
              return {
                ...l,
                questions: l.questions.map((q: any) => {
                  if (q.id === questionId) {
                    const newOptions = [...q.options];
                    newOptions[optionIndex] = value;
                    return { ...q, options: newOptions };
                  }
                  return q;
                })
              };
            }
            return l;
          })
        };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  const deleteQuestion = (itemId: number, questionId: number) => {
    if (!activeCourse) return;
    const updatedCourses = courses.map(c => {
      if (c.id === activeCourse.id) {
        return {
          ...c,
          items: c.items.map((l: any) => l.id === itemId ? { ...l, questions: l.questions.filter((q: any) => q.id !== questionId) } : l)
        };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* -------------------- LIST VIEW -------------------- */}
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الكورسات</h1>
              <p className="text-gray-500 mt-1 text-sm">أضف كورسات وابنِ المنهج الخاص بها (دروس، فيديوهات، ومرفقات).</p>
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-[#0B5C3B] hover:bg-[#073b26] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              إنشاء كورس جديد
            </button>
          </div>

          <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl shadow-sm">
            <div className="relative max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن كورس..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
            {filteredCourses.length > 0 ? (
              <Table>
                <TableHead className="bg-gray-50 dark:bg-[#09090b]/50">
                  <TableRow>
                    <TableHeaderCell className="text-right">اسم الكورس</TableHeaderCell>
                    <TableHeaderCell className="text-right">المحتويات</TableHeaderCell>
                    <TableHeaderCell className="text-right">الطلاب</TableHeaderCell>
                    <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                    <TableHeaderCell className="text-left">بناء المنهج</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Text className="font-bold text-gray-900 dark:text-white">{course.title}</Text>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-900/20 inline-block px-2 py-0.5 rounded">{course.grade || "عام"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge color="blue">{course.items?.length || 0} عناصر</Badge>
                      </TableCell>
                      <TableCell>
                        <Text style={{fontFamily: 'system-ui'}}>{course.students}</Text>
                      </TableCell>
                      <TableCell>
                        <Badge color={course.status === "نشط" ? "emerald" : "gray"}>{course.status}</Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => openBuilder(course.id)}
                            className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-md transition-colors font-medium"
                          >
                            <LayoutList size={16} />
                            إدارة المحتوى
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors" 
                            title="حذف الكورس"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-gray-500">لا توجد كورسات.</div>
            )}
          </div>
        </>
      )}

      {/* -------------------- BUILDER VIEW -------------------- */}
      {view === 'builder' && activeCourse && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="p-2 bg-white dark:bg-[#18181b] rounded-lg shadow-sm text-gray-500 hover:text-[#0B5C3B] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">بناء المنهج: {activeCourse.title}</h1>
              <p className="text-gray-500 mt-1 text-sm">أضف الدروس، ملفات الـ PDF، أو الاختبارات المستقلة بترتيب مخصص.</p>
            </div>
          </div>

          {/* Course Basic Info Settings */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">اسم الكورس</label>
              <input 
                type="text" 
                value={activeCourse.title}
                onChange={(e) => updateCourseInfo('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">المرحلة الدراسية</label>
              <select 
                value={activeCourse.grade}
                onChange={(e) => updateCourseInfo('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none"
              >
                <option value="القدرات العامة">القدرات العامة</option>
                <option value="التحصيلي">التحصيلي</option>
                <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                <option value="المرحلة المتوسطة">المرحلة المتوسطة</option>
                <option value="تأسيس عام">تأسيس عام</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">السعر (ريال)</label>
              <input 
                type="number" 
                value={activeCourse.price}
                onChange={(e) => updateCourseInfo('price', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">حالة الكورس (للظهور في الموقع)</label>
              <select 
                value={activeCourse.status}
                onChange={(e) => updateCourseInfo('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0B5C3B] ${activeCourse.status === 'نشط' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              >
                <option value="نشط">نشط (يظهر للطلاب)</option>
                <option value="مسودة">مسودة (مخفي)</option>
                <option value="مؤرشف">مؤرشف</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutList size={20} className="text-[#0B5C3B]" />
              محتوى المنهج
            </h2>
            <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => handleAddItem('lesson')}
              className="flex items-center gap-2 bg-[#0B5C3B] hover:bg-[#073b26] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              <Video size={16} />
              إضافة درس (فيديو)
            </button>
            <button 
              onClick={() => handleAddItem('pdf')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              <FileDown size={16} />
              إضافة ملف PDF فقط
            </button>
            <button 
              onClick={() => handleAddItem('quiz')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              <HelpCircle size={16} />
              إضافة اختبار / واجب
            </button>
            </div>
          </div>

          <div className="space-y-6">
            {!activeCourse.items || activeCourse.items.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-[#18181b] rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">هذا الكورس فارغ!</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">ابدأ ببناء منهجك الآن باستخدام الأزرار العلوية.</p>
              </div>
            ) : (
              activeCourse.items.map((item: any, index: number) => (
                <div key={item.id} className="bg-white dark:bg-[#18181b] p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 relative group">
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      item.type === 'lesson' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      item.type === 'pdf' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        placeholder="عنوان العنصر..."
                        className="text-lg font-bold bg-transparent border-none outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 w-full"
                      />
                      <p className="text-xs text-gray-500 font-medium px-1">
                        {item.type === 'lesson' ? 'درس مرئي (فيديو)' : item.type === 'pdf' ? 'مذكرة / ملف PDF' : 'اختبار / واجب'}
                      </p>
                    </div>
                  </div>

                  <div className="pl-11">
                    {/* LESSON SPECIFIC (VIDEO) */}
                    {item.type === 'lesson' && (
                      <div className="space-y-1 mb-4 max-w-xl">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <Video size={16} className="text-blue-500" /> فيديو الشرح
                        </label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingState(`${item.id}-video`);
                                const url = await uploadFile(file, 'videos');
                                if (url) updateItem(item.id, 'videoUrl', url);
                                setUploadingState(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={uploadingState === `${item.id}-video`}
                          />
                          <div className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 text-sm flex items-center justify-between shadow-sm">
                            <span className={item.videoUrl ? "text-gray-900 dark:text-white truncate" : "text-gray-400"}>
                              {uploadingState === `${item.id}-video` ? (
                                <span className="flex items-center gap-2 text-blue-600"><Loader2 size={14} className="animate-spin" /> جاري الرفع...</span>
                              ) : (item.videoUrl || "اضغط لرفع فيديو من جهازك...")}
                            </span>
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">تصفح</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PDF SPECIFIC */}
                    {item.type === 'pdf' && (
                      <div className="space-y-1 mb-4 max-w-xl">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <FileText size={16} className="text-red-500" /> ارفاق الملف
                        </label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept=".pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingState(`${item.id}-pdf`);
                                const url = await uploadFile(file, 'pdfs');
                                if (url) updateItem(item.id, 'pdfUrl', url);
                                setUploadingState(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={uploadingState === `${item.id}-pdf`}
                          />
                          <div className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 text-sm flex items-center justify-between shadow-sm">
                            <span className={item.pdfUrl ? "text-gray-900 dark:text-white truncate" : "text-gray-400"}>
                              {uploadingState === `${item.id}-pdf` ? (
                                <span className="flex items-center gap-2 text-red-600"><Loader2 size={14} className="animate-spin" /> جاري الرفع...</span>
                              ) : (item.pdfUrl || "اضغط لرفع ملف PDF...")}
                            </span>
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">تصفح</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QUIZ SPECIFIC */}
                    {(item.type === 'quiz' || item.type === 'lesson') && (
                      <div className={item.type === 'lesson' ? 'mt-8 border-t border-gray-100 dark:border-gray-800 pt-6' : ''}>
                        {item.type === 'lesson' && (
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <BookOpen size={16} className="text-amber-500" /> الواجب المرفق بالدرس (اختياري)
                          </label>
                        )}
                        
                        <div className={`p-5 rounded-xl ${item.type === 'lesson' ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' : ''}`}>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.type === 'quiz' ? 'ابنِ أسئلة الاختبار الخاص بك هنا.' : 'يمكنك إضافة أسئلة للواجب كجزء من هذا الدرس.'}
                            </span>
                            <button 
                              onClick={() => addQuestion(item.id)}
                              className="flex items-center justify-center gap-1 text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
                            >
                              <Plus size={16} /> إضافة سؤال
                            </button>
                          </div>

                          {item.questions?.length > 0 && (
                            <div className="space-y-6 mt-6">
                              {item.questions.map((q: any, qIndex: number) => (
                                <div key={q.id} className="p-4 bg-white dark:bg-[#18181b] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative">
                                  <button 
                                    onClick={() => deleteQuestion(item.id, q.id)}
                                    className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                  
                                  <div className="flex items-center gap-4 mb-4">
                                    <span className="font-bold text-gray-400">س {qIndex + 1}</span>
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                      <button 
                                        onClick={() => updateQuestion(item.id, q.id, 'type', 'text')}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${q.type === 'text' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                      >
                                        <Type size={14} /> نص
                                      </button>
                                      <button 
                                        onClick={() => updateQuestion(item.id, q.id, 'type', 'image')}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${q.type === 'image' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                      >
                                        <ImageIcon size={14} /> صورة
                                      </button>
                                    </div>
                                  </div>

                                  {/* Question Content Input */}
                                  <div className="mb-4">
                                    {q.type === 'text' ? (
                                      <textarea 
                                        value={q.content}
                                        onChange={(e) => updateQuestion(item.id, q.id, 'content', e.target.value)}
                                        placeholder="اكتب السؤال هنا..."
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                                      ></textarea>
                                    ) : (
                                      <div className="relative h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#09090b] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setUploadingState(`${item.id}-${q.id}-image`);
                                              const url = await uploadFile(file, 'images');
                                              if (url) updateQuestion(item.id, q.id, 'content', url);
                                              setUploadingState(null);
                                            }
                                          }}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                          disabled={uploadingState === `${item.id}-${q.id}-image`}
                                        />
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                          <ImageIcon size={18} />
                                          {uploadingState === `${item.id}-${q.id}-image` ? (
                                            <span className="flex items-center gap-2 text-amber-600"><Loader2 size={14} className="animate-spin" /> جاري الرفع...</span>
                                          ) : (q.content ? <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] inline-block">{q.content}</span> : "اضغط لرفع صورة السؤال")}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Options */}
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><HelpCircle size={14} /> الخيارات (حدد الإجابة الصحيحة)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {q.options.map((opt: string, optIndex: number) => (
                                        <div key={optIndex} className={`flex items-center gap-2 p-2 border rounded-lg transition-colors ${q.correctIndex === optIndex ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#09090b]'}`}>
                                          <input 
                                            type="radio" 
                                            name={`correct-${item.id}-${q.id}`} 
                                            checked={q.correctIndex === optIndex}
                                            onChange={() => updateQuestion(item.id, q.id, 'correctIndex', optIndex)}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                          />
                                          <input 
                                            type="text" 
                                            value={opt}
                                            onChange={(e) => updateQuestionOption(item.id, q.id, optIndex, e.target.value)}
                                            placeholder={`الخيار ${optIndex + 1}`}
                                            className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ))
            )}
          </div>
          
          {activeCourse.items && activeCourse.items.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {dbError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                  {dbError}
                </div>
              )}
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveCourse}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ المنهج في قاعدة البيانات'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">إنشاء كورس جديد</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConfirmCreateCourse} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الكورس</label>
                <input 
                  type="text" 
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none"
                  placeholder="مثال: القدرات العامة - التأسيس"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الصف / المرحلة المستهدفة</label>
                <select
                  value={newCourseGrade}
                  onChange={(e) => setNewCourseGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none"
                >
                  <option value="القدرات العامة">القدرات العامة</option>
                  <option value="التحصيلي">التحصيلي</option>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                  <option value="المرحلة المتوسطة">المرحلة المتوسطة</option>
                  <option value="تأسيس عام">تأسيس عام</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0B5C3B] hover:bg-[#073b26] text-white rounded-lg transition-colors font-medium"
                >
                  إنشاء ومتابعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
