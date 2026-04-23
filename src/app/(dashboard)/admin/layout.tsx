"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  LayoutDashboard, 
  BookOpen, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
  Save,
  Edit3,
  Ticket,
  Users,
  CreditCard,
  PieChart,
  ExternalLink
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // ----- Profile State -----
  const [profile, setProfile] = useState({ name: "أ. محمد العتيبي", title: "معلم خبير", avatar: "م" });
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single();
      if (data) {
        const loadedProfile = {
          name: data.full_name || "المعلم",
          title: data.role === 'admin' ? "مدير المنصة" : "معلم خبير",
          avatar: data.full_name ? data.full_name.charAt(0) : "م"
        };
        setProfile(loadedProfile);
        setEditForm(loadedProfile);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('profiles').update({ full_name: editForm.name }).eq('id', session.user.id);
    }
    setEditProfileOpen(false);
  };

  // ----- Notifications State -----
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "تنبيه أمان: محاولة تسجيل دخول من جهاز جديد للطلاب", time: "منذ 12 دقيقة", type: "alert", read: false },
    { id: 2, text: "قام 15 طالب باجتياز اختبار التفاضل", time: "منذ ساعة", type: "success", read: false },
    { id: 3, text: "توقف العديد من الطلاب عند الدقيقة 12 في درس الجبر", time: "منذ ساعتين", type: "alert", read: true },
  ]);

  useEffect(() => {
    const channel = supabase.channel('admin-dashboard');
    channel.on('broadcast', { event: 'activity' }, (payload) => {
      const newNotif = {
        id: Date.now(),
        text: payload.payload.text,
        time: "الآن",
        type: payload.payload.color.includes('emerald') || payload.payload.color.includes('green') || payload.payload.color.includes('blue') ? 'success' : 'alert',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  const unreadCount = notifications.filter(n => !n.read).length;

  // ----- Search State -----
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setSearchFocused] = useState(false);

  const navItems = [
    { name: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
    { name: "إدارة الكورسات", href: "/admin/courses", icon: BookOpen },
    { name: "إدارة الطلاب", href: "/admin/students", icon: Users },
    { name: "المبيعات", href: "/admin/sales", icon: CreditCard },
    { name: "الكوبونات", href: "/admin/coupons", icon: Ticket },
    { name: "التحليلات", href: "/admin/analytics", icon: PieChart },
    { name: "واجهة المتجر", href: "/", icon: ExternalLink },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#09090b] overflow-hidden font-sans text-gray-900 dark:text-gray-100" dir="rtl">
      
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        transition-all duration-300 ease-in-out
        bg-gradient-to-b from-[#0B5C3B] to-[#073b26] text-white shadow-xl
        flex flex-col h-full shrink-0 relative z-20
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#C9A227] to-[#e6c240] flex items-center justify-center text-[#0B5C3B] font-bold shrink-0 shadow-sm">
              ∑
            </div>
            {isSidebarOpen && <span className="font-bold text-lg whitespace-nowrap text-white">معلم رياضيات+</span>}
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white/70 hover:text-white lg:hidden transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {isSidebarOpen && <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-4 opacity-80">القائمة الرئيسية</p>}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-white/20 text-white font-bold shadow-sm backdrop-blur-md border border-white/10" 
                      : "text-emerald-100 hover:bg-white/10 hover:text-white"}
                  `}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon size={20} className={isActive ? "text-[#C9A227]" : "opacity-80"} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6] dark:bg-[#09090b]">
        
        {/* Header (Navbar) */}
        <header className="h-16 bg-white dark:bg-[#18181b] shadow-sm border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <Menu size={20} />
            </button>
            
            {/* Functional Search */}
            <div className="relative hidden md:block max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="ابحث عن كورس، درس، أو طالب..." 
                className="pl-4 pr-10 py-2 w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-[#09090b] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-gray-500 mb-2 px-2">نتائج البحث عن "{searchQuery}"</p>
                  <Link href="/courses" className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    <span className="text-[#C9A227] font-bold block">كورس:</span> التفاضل والتكامل (ثالث ثانوي)
                  </Link>
                  <Link href="/courses" className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    <span className="text-[#0B5C3B] font-bold block">درس:</span> مشتقات الدوال المثلثية
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                  <button className="w-full text-center text-xs text-[#0B5C3B] py-2 hover:underline">عرض كل النتائج</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Functional Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#18181b]">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-[#0B5C3B] hover:underline font-medium">تحديد الكل كمقروء</button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#09090b] transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                          {notif.type === 'alert' ? <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} /> : <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />}
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{notif.text}</p>
                            <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'system-ui'}}>{notif.time}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-500 text-sm">لا توجد إشعارات جديدة.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
            
            {/* Functional Profile */}
            <div 
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors group"
            >
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#0B5C3B] transition-colors">{profile.name}</p>
                <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                  <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {profile.title}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-sm">
                {profile.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">إعدادات الملف الشخصي</h2>
              <button onClick={() => setEditProfileOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المعلم</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المسمى الوظيفي</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حرف أو رمز الأيقونة</label>
                <input 
                  type="text" 
                  value={editForm.avatar}
                  maxLength={2}
                  onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0B5C3B] bg-white dark:bg-[#09090b] outline-none text-center font-bold"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B5C3B] hover:bg-[#073b26] text-white rounded-lg transition-colors font-medium"
                >
                  <Save size={16} /> حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
