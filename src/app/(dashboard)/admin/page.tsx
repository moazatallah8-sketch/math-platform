"use client";

import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { Users, BookOpen, Wallet, Activity, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<{
    revenue: any[];
    topCourses: any[];
    devices: any[];
    liveFeed: {color: string; text: string; time: string}[];
    kpis: { revenue: number; activeStudents: number; views: number; completionRate: number };
  }>({
    revenue: [],
    topCourses: [],
    devices: [],
    liveFeed: [],
    kpis: { revenue: 0, activeStudents: 0, views: 0, completionRate: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const supabase = createClient();

  // إعداد الاتصال اللحظي (Supabase Realtime)
  useEffect(() => {
    const channel = supabase.channel('admin-dashboard');

    channel
      .on(
        'broadcast',
        { event: 'activity' },
        (payload) => {
          setDashboardData(prev => ({
            ...prev,
            liveFeed: [payload.payload, ...prev.liveFeed].slice(0, 10) // احتفظ بآخر 10 أحداث فقط
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const simulateEvent = async () => {
    const events = [
      { text: 'طالب جديد اشترى كورس "التفاضل والتكامل"', color: 'bg-emerald-500' },
      { text: 'أحمد اجتاز الاختبار النهائي بنسبة 95%', color: 'bg-blue-500' },
      { text: 'تم استخدام كوبون خصم #MATH20', color: 'bg-amber-500' }
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const payload = {
      ...randomEvent,
      time: 'الآن'
    };

    const channel = supabase.channel('admin-dashboard');
    await channel.send({
      type: 'broadcast',
      event: 'activity',
      payload
    });
  };

  // هيكل لجلب البيانات الحقيقية من قاعدة البيانات
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: kpis, error } = await supabase.rpc('get_dashboard_kpis');
        if (!error && kpis) {
          setDashboardData(prev => ({
            ...prev,
            kpis: {
              revenue: kpis.revenue || 0,
              activeStudents: kpis.activeStudents || 0,
              views: kpis.views || 0,
              completionRate: kpis.completionRate || 0
            }
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [supabase]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظرة عامة (KPIs)</h1>
          <p className="text-gray-500 mt-1 text-sm">مراقبة الأداء المالي والتحليلات اللحظية للمنصة.</p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-600">متصل لحظياً (Supabase)</span>
            </>
          ) : connectionStatus === 'connecting' ? (
             <span className="text-sm font-medium text-amber-500">جاري الاتصال...</span>
          ) : (
             <span className="text-sm font-medium text-red-500">غير متصل</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl border-l-4 border-l-[#0B5C3B] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">إجمالي الأرباح</p>
              <h3 className="text-2xl text-gray-900 dark:text-white font-bold" style={{fontFamily: 'system-ui, sans-serif'}}>
                {dashboardData.kpis.revenue} SAR
              </h3>
            </div>
            <div className="p-3 bg-[#0B5C3B]/10 rounded-lg text-[#0B5C3B]">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl border-l-4 border-l-[#1D4ED8] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">الطلاب النشطين</p>
              <h3 className="text-2xl text-gray-900 dark:text-white font-bold" style={{fontFamily: 'system-ui, sans-serif'}}>
                {dashboardData.kpis.activeStudents}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-[#1D4ED8] dark:text-blue-400">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl border-l-4 border-l-[#C9A227] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">مشاهدات الدروس</p>
              <h3 className="text-2xl text-gray-900 dark:text-white font-bold" style={{fontFamily: 'system-ui, sans-serif'}}>
                {dashboardData.kpis.views}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-[#C9A227]">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl border-l-4 border-l-[#7C3AED] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">معدل إكمال الكورسات</p>
              <h3 className="text-2xl text-gray-900 dark:text-white font-bold" style={{fontFamily: 'system-ui, sans-serif'}}>
                {dashboardData.kpis.completionRate}%
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-[#7C3AED] dark:text-purple-400">
              <BookOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">تحليل الإيرادات</h2>
          <p className="text-sm text-gray-500 mb-6">مقارنة بين الإيرادات الفعلية والمتوقعة (تحديث لحظي)</p>
          
          <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            {dashboardData.revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.revenue}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B5C3B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0B5C3B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontFamily: 'system-ui'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontFamily: 'system-ui, sans-serif'}}
                  />
                  <Area type="monotone" dataKey="الأرباح" stroke="#0B5C3B" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <Activity size={32} className="mb-2 opacity-50" />
                <p>لا توجد بيانات للعرض حالياً</p>
                <p className="text-xs">في انتظار الربط مع قاعدة البيانات...</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">الكورسات الأعلى مبيعاً</h2>
          <p className="text-sm text-gray-500 mb-6">عدد المشتركين الجدد</p>
          
          <div className="h-72 w-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            {dashboardData.topCourses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.topCourses} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#C9A227" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <BookOpen size={32} className="mb-2 opacity-50" />
                <p>لا توجد بيانات للعرض</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Devices Analytics */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">الأجهزة المستخدمة للوصول</h2>
          <p className="text-sm text-gray-500 mb-6">تحليل الأجهزة لضمان الحماية (مكافحة القرصنة)</p>
          
          <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            {dashboardData.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboardData.devices} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dashboardData.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0B5C3B', '#1D4ED8', '#C9A227'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p>بانتظار تفعيل مركز الأمان (الخطوة 4)</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">شريط النشاط اللحظي (Live Feed)</h2>
            <div className="flex gap-2 items-center">
              <button onClick={simulateEvent} className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 transition-colors" title="تجربة إرسال حدث">
                <Send size={16} />
              </button>
              <Activity className={`w-5 h-5 ${connectionStatus === 'connected' ? 'text-[#0B5C3B] animate-pulse' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            {dashboardData.liveFeed.length > 0 ? (
              <div className="space-y-4 w-full p-4 overflow-y-auto h-full">
                {dashboardData.liveFeed.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${activity.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white" dir="auto">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'system-ui, sans-serif'}}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center p-4">
                <Activity size={32} className="mb-3 opacity-50" />
                <p className="font-medium text-gray-600 dark:text-gray-300">لا توجد أحداث حية حالياً</p>
                <p className="text-xs mt-1 text-gray-500">في انتظار الأحداث من قنوات Supabase Realtime...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
