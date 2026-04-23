import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import StudyRoomClient from "@/components/StudyRoomClient";

export default async function StudyRoomPage({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId)) notFound();

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Verify enrollment or check if Admin/Teacher
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  if (!isAdminOrTeacher) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!enrollment) {
      // Not enrolled! Redirect to checkout
      redirect(`/checkout/${courseId}`);
    }
  }

  // Fetch full course details
  const { data: course, error } = await supabase
    .from('courses')
    .select('*, course_items(*, questions(*))')
    .eq('id', courseId)
    .single();

  if (error || !course) notFound();

  // Sort items and questions
  if (course.course_items) {
    course.course_items.sort((a: any, b: any) => a.order_index - b.order_index);
    course.course_items.forEach((item: any) => {
      if (item.questions) {
        item.questions.sort((a: any, b: any) => a.order_index - b.order_index);
      }
    });
  }

  return (
    <StudyRoomClient course={course} />
  );
}
