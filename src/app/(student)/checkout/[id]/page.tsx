"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Ticket, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { validateCoupon, processEnrollment } from "@/app/actions/checkout";
import { fetchCourseDetails } from "@/app/actions/marketing";

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id, 10);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponResult, setCouponResult] = useState<{valid: boolean, newPrice?: number, error?: string} | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchCourseDetails(courseId);
      if (!data) {
        router.push('/courses');
        return;
      }
      setCourse(data);
      setIsLoading(false);
    }
    if (!isNaN(courseId)) load();
  }, [courseId, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponResult(null);
    
    try {
      const res = await validateCoupon(couponCode, course.price);
      setCouponResult(res);
    } catch (err: any) {
      setCouponResult({ valid: false, error: "حدث خطأ أثناء التحقق." });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setEnrollError(null);
    
    try {
      await processEnrollment(courseId, couponResult?.valid ? couponCode : undefined);
      // Success! Redirect to student dashboard
      router.push('/student');
    } catch (err: any) {
      setEnrollError(err.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#0B5C3B]" size={48} /></div>;
  }

  const currentPrice = couponResult?.valid && couponResult.newPrice !== undefined ? couponResult.newPrice : course.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <Lock className="text-[#0B5C3B]" /> إتمام الاشتراك
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-4">تفاصيل الكورس</h2>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#0B5C3B] mb-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm">{course.grade}</p>
                </div>
                <div className="text-2xl font-black text-gray-900 line-through opacity-50">
                  {couponResult?.valid && `${course.price} ريال`}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-4">هل لديك كود خصم؟</h2>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="أدخل كود الخصم هنا..." 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-left font-mono focus:ring-2 focus:ring-[#0B5C3B] outline-none"
                  disabled={couponResult?.valid || isApplyingCoupon}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponResult?.valid || isApplyingCoupon}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-800 flex items-center gap-2"
                >
                  {isApplyingCoupon ? <Loader2 className="animate-spin" size={18} /> : <Ticket size={18} />}
                  تطبيق
                </button>
              </div>
              
              {couponResult && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${couponResult.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {couponResult.valid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {couponResult.valid ? `تم تفعيل الخصم بنجاح! السعر الجديد: ${couponResult.newPrice} ريال` : couponResult.error}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-[#0B5C3B] rounded-2xl p-6 text-white shadow-xl sticky top-8">
              <h2 className="font-bold text-lg mb-6 border-b border-white/20 pb-4">الملخص</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm text-emerald-100">
                  <span>سعر الكورس</span>
                  <span>{course.price} ريال</span>
                </div>
                {couponResult?.valid && (
                  <div className="flex justify-between text-sm text-amber-300 font-bold">
                    <span>الخصم</span>
                    <span>- {course.price - (couponResult.newPrice || 0)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-2xl pt-4 border-t border-white/20">
                  <span>الإجمالي</span>
                  <span>{currentPrice} ريال</span>
                </div>
              </div>

              {enrollError && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm flex gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{enrollError}</span>
                </div>
              )}

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#C9A227] hover:bg-[#b08d22] text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg transition-colors"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                {currentPrice > 0 ? 'تأكيد الدفع والاشتراك' : 'اشترك مجاناً الآن'}
              </button>
              <p className="text-center text-xs text-emerald-200/60 mt-4">نظام الدفع آمن ومحمي 100%</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
