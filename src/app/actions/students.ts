"use server";
import { createClient } from '@/utils/supabase/server';

export async function fetchStudents() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
