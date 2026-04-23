"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processEnrollment(courseId: number, couponCode?: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("يجب تسجيل الدخول لإتمام عملية الشراء.");
  }

  const userId = session.user.id;

  // Check if already enrolled
  const { data: existing } = await supabase.from('enrollments').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
  if (existing) {
    throw new Error("أنت مسجل في هذا الكورس بالفعل!");
  }

  // Get Course Details
  const { data: course, error: courseError } = await supabase.from('courses').select('price, status').eq('id', courseId).single();
  
  if (courseError || !course) {
    throw new Error("الكورس غير موجود.");
  }

  if (course.status !== 'نشط') {
    throw new Error("هذا الكورس غير متاح للتسجيل حالياً.");
  }

  let finalPrice = Number(course.price) || 0;
  let usedCouponId = null;

  // Process Coupon
  if (couponCode && couponCode.trim() !== '') {
    const { data: coupon, error: couponError } = await supabase.from('coupons').select('*').eq('code', couponCode.trim()).single();
    
    if (couponError || !coupon) {
      throw new Error("كود الخصم غير صحيح.");
    }
    
    if (coupon.uses_count >= coupon.max_uses) {
      throw new Error("كود الخصم وصل للحد الأقصى من الاستخدام.");
    }
    
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error("كود الخصم منتهي الصلاحية.");
    }

    const discountAmount = finalPrice * (coupon.discount_percentage / 100);
    finalPrice = Math.max(0, finalPrice - discountAmount);
    usedCouponId = coupon.id;
  }

  // Create Enrollment
  const { error: enrollError } = await supabase.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    amount_paid: finalPrice
  });

  if (enrollError) {
    throw new Error("حدث خطأ أثناء إتمام التسجيل: " + enrollError.message);
  }

  // Update coupon usage
  if (usedCouponId) {
    const { data: currentCoupon } = await supabase.from('coupons').select('uses_count').eq('id', usedCouponId).single();
    if (currentCoupon) {
      await supabase.from('coupons').update({ uses_count: currentCoupon.uses_count + 1 }).eq('id', usedCouponId);
    }
  }

  revalidatePath('/student');
  return true;
}

export async function validateCoupon(code: string, originalPrice: number) {
  const supabase = createClient();
  const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code.trim()).single();
  
  if (error || !coupon) {
    return { valid: false, error: "كود الخصم غير صحيح." };
  }
  
  if (coupon.uses_count >= coupon.max_uses) {
    return { valid: false, error: "كود الخصم وصل للحد الأقصى من الاستخدام." };
  }
  
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: "كود الخصم منتهي الصلاحية." };
  }

  const discountAmount = originalPrice * (coupon.discount_percentage / 100);
  const newPrice = Math.max(0, originalPrice - discountAmount);

  return { valid: true, discountPercentage: coupon.discount_percentage, newPrice };
}
