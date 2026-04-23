"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge, Card, Metric
} from "@tremor/react";
import { Search, CreditCard, Clock, Activity, Loader2 } from "lucide-react";
import { fetchSales, createMockSaleAction } from "@/app/actions/sales";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMocking, setIsMocking] = useState(false);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchSales();
      setSales(data || []);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoaded(true);
    }
  }

  const handleCreateMockSale = async () => {
    setIsMocking(true);
    setErrorMsg(null);
    try {
      await createMockSaleAction();
      await loadData(); // refresh list
      alert("تم إنشاء بيعة وهمية بنجاح للتحقق من المبيعات والدشبورد!");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsMocking(false);
    }
  };

  const filteredSales = sales.filter(s => 
    (s.profiles?.full_name && s.profiles.full_name.includes(search)) || 
    (s.courses?.title && s.courses.title.includes(search))
  );

  const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.amount_paid), 0);

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-[#0B5C3B]" /> المبيعات والمشتركون
          </h1>
          <p className="text-gray-500 mt-1 text-sm">تابع عمليات الشراء واشتراكات الطلاب في الكورسات.</p>
        </div>
        <button 
          onClick={handleCreateMockSale}
          disabled={isMocking}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {isMocking ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
          اختبار إدخال بيعة وهمية
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card decoration="top" decorationColor="emerald">
          <Text>إجمالي الأرباح</Text>
          <Metric className="mt-2 text-[#0B5C3B]">{totalRevenue} ريال</Metric>
        </Card>
        <Card decoration="top" decorationColor="blue">
          <Text>عدد عمليات الشراء</Text>
          <Metric className="mt-2">{sales.length}</Metric>
        </Card>
      </div>

      <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث باسم الطالب أو اسم الكورس..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#0B5C3B] outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        {filteredSales.length > 0 ? (
          <Table>
            <TableHead className="bg-gray-50 dark:bg-[#09090b]/50">
              <TableRow>
                <TableHeaderCell className="text-right">رقم العملية</TableHeaderCell>
                <TableHeaderCell className="text-right">الطالب</TableHeaderCell>
                <TableHeaderCell className="text-right">الكورس</TableHeaderCell>
                <TableHeaderCell className="text-right">المبلغ المدفوع</TableHeaderCell>
                <TableHeaderCell className="text-right">تاريخ العملية</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Text className="font-mono text-xs">#{sale.id.toString().padStart(6, '0')}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="font-bold text-gray-900 dark:text-white">{sale.profiles?.full_name || "بدون اسم"}</Text>
                    <p className="text-xs text-gray-500">{sale.profiles?.email}</p>
                  </TableCell>
                  <TableCell>
                    <Text>{sale.courses?.title || "كورس محذوف"}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge color="emerald" icon={CreditCard}>{sale.amount_paid} ريال</Badge>
                  </TableCell>
                  <TableCell>
                    <Text className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                      <Clock size={14} /> 
                      <span style={{fontFamily: 'system-ui'}}>
                        {new Date(sale.created_at).toLocaleDateString('ar-SA')} - {new Date(sale.created_at).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CreditCard size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد مبيعات!</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">لم يقم أي طالب بشراء أي كورس حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
