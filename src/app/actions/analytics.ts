"use server";
import { createClient } from '@/utils/supabase/server';

export async function fetchAdvancedAnalytics() {
  const supabase = createClient();
  
  // Try to fetch from video_analytics and quiz_attempts (might fail if tables not created yet)
  const { data: videoData, error: videoError } = await supabase
    .from('video_analytics')
    .select('*');

  const { data: quizData, error: quizError } = await supabase
    .from('quiz_attempts')
    .select('is_correct, questions(content)');

  const hasRealVideoData = videoData && videoData.length > 0;
  const hasRealQuizData = quizData && quizData.length > 0;

  // We return empty arrays if no data. The frontend will decide whether to show an empty state.
  return {
    videoData: hasRealVideoData ? videoData : [],
    quizData: hasRealQuizData ? quizData : [],
    hasRealData: hasRealVideoData || hasRealQuizData,
    dbError: videoError?.message || quizError?.message || null
  };
}
