"use server";
import { createClient } from '@/utils/supabase/server';

export async function fetchMyCourses() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return [];

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  if (isAdminOrTeacher) {
    // Admins/Teachers see all active courses as if they are enrolled
    const { data: allCourses, error } = await supabase
      .from('courses')
      .select('*, course_items(id)')
      .neq('status', 'مؤرشف') // Show everything except archived
      .order('created_at', { ascending: false });

    if (error) return [];
    return allCourses.map((c: any) => ({
      enrollment_id: 0, // Mock ID for admins
      id: c.id,
      title: c.title,
      grade: c.grade,
      status: c.status,
      itemsCount: c.course_items?.length || 0,
      progress: 100, // Show full progress for teacher
    }));
  }

  // Regular students see their enrollments
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      amount_paid,
      courses (
        id,
        title,
        grade,
        status,
        course_items (id)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching my courses:", error);
    return [];
  }

  return data.map((enrollment: any) => ({
    enrollment_id: enrollment.id,
    id: enrollment.courses?.id,
    title: enrollment.courses?.title,
    grade: enrollment.courses?.grade,
    status: enrollment.courses?.status,
    itemsCount: enrollment.courses?.course_items?.length || 0,
    progress: 0,
  })).filter((c: any) => c.id);
}

// --------------------------------------------------------------------------------
// Study Room Analytics Tracking
// --------------------------------------------------------------------------------

export async function recordVideoDropoff(courseItemId: number, minute: number) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase.from('video_analytics').insert({
    course_item_id: courseItemId,
    user_id: session.user.id,
    drop_off_minute: minute
  });

  if (error) console.error("Error recording video drop-off:", error);
}

export async function recordQuizAttempt(questionId: number, isCorrect: boolean) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase.from('quiz_attempts').insert({
    question_id: questionId,
    user_id: session.user.id,
    is_correct: isCorrect
  });

  if (error) console.error("Error recording quiz attempt:", error);
}

