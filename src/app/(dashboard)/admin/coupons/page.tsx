"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge
} from "@tremor/react";
import { Plus, Trash2, Search, Ticket, Copy, Check, Percent, DollarSign, RefreshCw, X, Loader2 } from "lucide-react";
import { fetchCoupons, createCouponAction, deleteCouponAction } from "@/app/actions/coupons";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 10,
    usageLimit: 100
  });

  // Load from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCoupons();
        setCoupons(data || []);
      } catch (err) {
        console.error("Failed to load coupons", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const data = await createCouponAction(newCoupon);
      setCoupons([data, ...coupons]);
      setCreateModalOpen(false);
      setNewCoupon({ code: "", type: "percentage", value: 10, usageLimit: 100 });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (confirm("هل تريد حذف هذا الكوبون نهائياً؟")) {
      try {
        await deleteCouponAction(id);
        setCoupons(coupons.filter(c => c.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'MATH';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code: result });
  };

  const copyToClipboard = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ticket className="text-[#C9A227]" /> إدارة الكوبونات والعروض
          </h1>
          <p className="text-gray-500 mt-1 text-sm">أنشئ أكواد خصم ترويجية لزيادة مبيعات كورساتك وتتبع استخدامها.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#0B5C3B] hover:bg-[#073b26] text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          إنشاء كوبون جديد
        </button>
      </div>

      <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن كود خصم..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none uppercase"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        {filteredCoupons.length > 0 ? (
          <Table>
            <TableHead className="bg-gray-50 dark:bg-[#09090b]/50">
              <TableRow>
                <TableHeaderCell className="text-right">كود الخصم</TableHeaderCell>
                <TableHeaderCell className="text-right">قيمة الخصم</TableHeaderCell>
                <TableHeaderCell className="text-right">الاستخدام</TableHeaderCell>
                <TableHeaderCell className="text-right">تاريخ الإنشاء</TableHeaderCell>
                <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                <TableHeaderCell className="text-left">إجراءات</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCoupons.map((coupon) => {
                // UI compatibility mapping since DB uses snake_case and different names
                const usageLimit = coupon.max_uses || coupon.usageLimit;
                const usedCount = coupon.uses_count || coupon.usedCount || 0;
                const value = coupon.discount_percentage || coupon.value;
                const createdAt = coupon.created_at ? coupon.created_at.split('T')[0] : coupon.createdAt;
                
                // Determine Status dynamically if it's from DB
                const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                const isFullyUsed = usageLimit > 0 && usedCount >= usageLimit;
                const status = isExpired ? "منتهي" : isFullyUsed ? "مكتمل العدد" : "نشط";

                const usagePercentage = usageLimit > 0 ? Math.min(100, Math.round((usedCount / usageLimit) * 100)) : 0;
                
                return (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono font-bold px-3 py-1 rounded-md border border-amber-200 dark:border-amber-800 tracking-wider">
                        {coupon.code}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(coupon.id, coupon.code)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-800 rounded-md"
                        title="نسخ الكود"
                      >
                        {copiedId === coupon.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Text className="font-bold flex items-center gap-1">
                      {coupon.type === 'fixed' ? (
                        <><DollarSign size={14} className="text-emerald-500" /> {value} ريال</>
                      ) : (
                        <><Percent size={14} className="text-blue-500" /> {value}%</>
                      )}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-[120px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{usedCount}</span>
                        <span className="text-gray-500">من {usageLimit > 0 ? usageLimit : 'بلا حدود'}</span>
                      </div>
                      {usageLimit > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isFullyUsed ? 'bg-red-500' : 'bg-[#0B5C3B]'}`} 
                            style={{ width: `${usagePercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Text style={{fontFamily: 'system-ui'}}>{createdAt}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge color={status === "مكتمل العدد" ? "red" : status === "نشط" ? "emerald" : "gray"}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <button 
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex" 
                      title="حذف الكوبون"
                    >
                      <Trash2 size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Ticket size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد كوبونات!</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">لم تقم بإنشاء أي أكواد خصم بعد، أو لا يوجد كود يطابق بحثك.</p>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#09090b]/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket size={20} className="text-[#C9A227]" /> إنشاء كود خصم
              </h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="p-5 space-y-5">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">كود الخصم</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none font-mono text-lg tracking-widest uppercase text-center"
                    placeholder="مثال: MATH50"
                    required
                  />
                  <button 
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                    title="توليد كود عشوائي"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">نوع الخصم</label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setNewCoupon({...newCoupon, type: 'percentage'})}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newCoupon.type === 'percentage' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
                    >
                      نسبة <Percent size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCoupon({...newCoupon, type: 'fixed'})}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newCoupon.type === 'fixed' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
                    >
                      مبلغ <DollarSign size={14} />
                    </button>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">القيمة</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="1"
                      max={newCoupon.type === 'percentage' ? "100" : undefined}
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none font-bold"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                      {newCoupon.type === 'percentage' ? '%' : 'ر.س'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الحد الأقصى للاستخدام <span className="text-xs text-gray-500 font-normal">(كم طالب يمكنه استخدام الكود؟)</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none"
                  />
                  {newCoupon.usageLimit === 0 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
                      غير محدود
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium text-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#0B5C3B] hover:bg-[#073b26] text-white rounded-lg transition-colors font-bold shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} 
                  {isSaving ? "جاري الإنشاء..." : "إنشاء الكوبون"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
