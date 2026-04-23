import { createClient } from '@/utils/supabase/client';
import { z } from 'zod';

// ==========================================
// Zod Schemas for Validation
// ==========================================
export const questionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['text', 'image']),
  content: z.string().min(1, "محتوى السؤال مطلوب"),
  options: z.array(z.string()).length(4, "يجب تحديد 4 خيارات"),
  correctIndex: z.number().min(0).max(3)
});

export const courseItemSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['lesson', 'pdf', 'quiz']),
  title: z.string().min(1, "عنوان العنصر مطلوب"),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  questions: z.array(questionSchema).optional()
});

export const courseSchema = z.object({
  title: z.string().min(3, "اسم الكورس يجب أن يكون 3 أحرف على الأقل"),
  grade: z.string().min(1, "يرجى تحديد المرحلة"),
  price: z.number().min(0, "السعر لا يمكن أن يكون سالباً"),
  status: z.enum(['مسودة', 'نشط', 'مؤرشف']).default('مسودة'),
  items: z.array(courseItemSchema).optional()
});

export type CourseData = z.infer<typeof courseSchema>;

// ==========================================
// Database Operations
// ==========================================

export async function fetchCourses() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_items(*, questions(*))')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  
  // Transform to match UI state
  return data.map((c: any) => ({
    id: c.id,
    title: c.title,
    grade: c.grade,
    price: c.price,
    status: c.status,
    students: c.students_count,
    items: (c.course_items || []).map((item: any) => ({
      id: item.id,
      type: item.item_type,
      title: item.title,
      videoUrl: item.video_url,
      pdfUrl: item.pdf_url,
      questions: (item.questions || []).map((q: any) => ({
        id: q.id,
        type: q.question_type,
        content: q.content,
        options: q.options,
        correctIndex: q.correct_index
      }))
    }))
  }));
}

export async function saveCourseFull(course: any) {
  const supabase = createClient();
  // 1. Validate with Zod
  const validation = courseSchema.safeParse(course);
  if (!validation.success) {
    console.error("Validation error:", validation.error.format());
    throw new Error(validation.error.issues[0].message);
  }

  // 2. Insert or Update Course
  let courseId = course.id;
  const isNew = typeof courseId === 'number' && courseId > 1000000000; // Time-based ID check
  
  if (isNew || !courseId) {
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        grade: course.grade,
        price: course.price || 0,
        status: course.status || 'مسودة',
      })
      .select()
      .single();
      
    if (courseError) throw new Error("فشل حفظ الكورس: " + courseError.message);
    courseId = newCourse.id;
  } else {
    const { error: courseError } = await supabase
      .from('courses')
      .update({
        title: course.title,
        grade: course.grade,
        price: course.price || 0,
        status: course.status || 'مسودة',
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);
      
    if (courseError) throw new Error("فشل تحديث الكورس: " + courseError.message);
    
    // Delete old items to replace them (Simple approach for complex relations)
    await supabase.from('course_items').delete().eq('course_id', courseId);
  }

  // 3. Insert Items and Questions
  if (course.items && course.items.length > 0) {
    for (let i = 0; i < course.items.length; i++) {
      const item = course.items[i];
      const { data: newItem, error: itemError } = await supabase
        .from('course_items')
        .insert({
          course_id: courseId,
          item_type: item.type,
          title: item.title,
          video_url: item.videoUrl || null,
          pdf_url: item.pdfUrl || null,
          order_index: i
        })
        .select()
        .single();

      if (itemError) throw new Error("فشل حفظ محتوى الكورس: " + itemError.message);

      // Insert Questions if any
      if (item.questions && item.questions.length > 0) {
        const questionsToInsert = item.questions.map((q: any, qIdx: number) => ({
          course_item_id: newItem.id,
          question_type: q.type || 'text',
          content: q.content,
          options: q.options,
          correct_index: q.correctIndex,
          order_index: qIdx
        }));

        const { error: qError } = await supabase.from('questions').insert(questionsToInsert);
        if (qError) throw new Error("فشل حفظ الأسئلة: " + qError.message);
      }
    }
  }

  return true;
}

export async function deleteCourse(courseId: number) {
  const supabase = createClient();
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw new Error("فشل حذف الكورس: " + error.message);
  return true;
}
