"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchSales() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      amount_paid,
      created_at,
      profiles ( full_name, email ),
      courses ( title )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createMockSaleAction() {
  const supabase = createClient();
  
  // 1. Ensure we have at least one course
  const { data: courses } = await supabase.from('courses').select('id, price').limit(1);
  if (!courses || courses.length === 0) {
    throw new Error("لا توجد كورسات في قاعدة البيانات لإنشاء مبيعات.");
  }
  
  // 2. Ensure we have at least one student, if not, create a dummy one
  let { data: students } = await supabase.from('profiles').select('id').eq('role', 'student').limit(1);
  
  let studentId = students?.[0]?.id;
  
  if (!studentId) {
    // Cannot easily create auth user via server client without admin API, 
    // so we will fail gracefully if no students exist yet.
    throw new Error("لا يوجد أي طالب مسجل في قاعدة البيانات. قم بتسجيل الدخول كطالب أولاً لتجربة المبيعات.");
  }

  // 3. Create Enrollment
  const { error } = await supabase.from('enrollments').insert({
    user_id: studentId,
    course_id: courses[0].id,
    amount_paid: courses[0].price || 150
  });

  if (error) throw new Error("فشل إنشاء البيعة الوهمية: " + error.message);
  
  revalidatePath('/sales');
  revalidatePath('/'); // Refresh dashboard
  return true;
}
