export interface Course {
  id: number;
  title: string;
  grade: string;
  price: number;
  status: 'نشط' | 'مسودة' | 'مؤرشف';
  students_count?: number;
  created_at?: string;
  course_items?: CourseItem[];
}

export interface CourseItem {
  id: number;
  course_id: number;
  item_type: 'lesson' | 'quiz' | 'pdf';
  title: string;
  video_url?: string | null;
  pdf_url?: string | null;
  order_index: number;
  questions?: Question[];
}

export interface Question {
  id: number;
  course_item_id: number;
  type: 'text' | 'image';
  content: string;
  options: string[];
  correct_index: number;
  order_index: number;
}
