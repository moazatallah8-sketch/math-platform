"use server";
import { createClient } from '@/utils/supabase/server';

export async function fetchMarketingStats() {
  const supabase = createClient();
  
  const { count: activeCoursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'نشط');

  const { count: studentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  return {
    coursesCount: activeCoursesCount || 0,
    studentsCount: studentsCount || 0,
  };
}

export async function fetchActiveCourses(limit?: number) {
  const supabase = createClient();
  let query = supabase
    .from('courses')
    .select('id, title, grade, price, students_count, created_at')
    .eq('status', 'نشط')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching active courses:", error);
    return [];
  }
  
  return data;
}

export async function fetchCourseDetails(id: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_items(*)')
    .eq('id', id)
    .eq('status', 'نشط')
    .single();

  if (error) return null;
  
  // Sort items by order_index
  if (data && data.course_items) {
    data.course_items.sort((a: any, b: any) => a.order_index - b.order_index);
  }

  return data;
}
