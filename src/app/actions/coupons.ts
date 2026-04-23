"use server";

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const couponSchema = z.object({
  code: z.string().min(3, "كود الخصم يجب أن يكون 3 أحرف على الأقل").regex(/^[A-Z0-9]+$/, "الكود يجب أن يحتوي على أحرف إنجليزية كبيرة وأرقام فقط"),
  discount_percentage: z.number().min(1, "الخصم لا يقل عن 1%").max(100, "الخصم لا يزيد عن 100%"),
  max_uses: z.number().min(0, "حد الاستخدام لا يمكن أن يكون سالباً").default(100),
});

export async function fetchCoupons() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
  return data;
}

export async function createCouponAction(formData: any) {
  const supabase = createClient();
  
  // 1. Zod Validation
  const validation = couponSchema.safeParse({
    code: formData.code,
    discount_percentage: formData.value, // value is mapped to discount_percentage
    max_uses: formData.usageLimit
  });

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  // 2. Database Insert
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: validation.data.code,
      discount_percentage: validation.data.discount_percentage,
      max_uses: validation.data.max_uses,
      uses_count: 0
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error("كود الخصم هذا موجود مسبقاً!");
    throw new Error("فشل إنشاء الكوبون: " + error.message);
  }

  revalidatePath('/coupons');
  return data;
}

export async function deleteCouponAction(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error("فشل الحذف: " + error.message);
  
  revalidatePath('/coupons');
  return true;
}
