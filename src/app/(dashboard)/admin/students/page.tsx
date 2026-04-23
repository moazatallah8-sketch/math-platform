"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge
} from "@tremor/react";
import { Search, Users, Mail, Calendar } from "lucide-react";
import { fetchStudents } from "@/app/actions/students";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchStudents();
        setStudents(data || []);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const filteredStudents = students.filter(s => 
    (s.full_name && s.full_name.includes(search)) || 
    (s.email && s.email.includes(search))
  );

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-[#1D4ED8]" /> إدارة الطلاب
          </h1>
          <p className="text-gray-500 mt-1 text-sm">استعرض بيانات الطلاب المسجلين في المنصة وتاريخ انضمامهم.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
          حدث خطأ أثناء جلب البيانات: {errorMsg}
        </div>
      )}

      <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو البريد الإلكتروني..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#09090b] text-sm focus:ring-2 focus:ring-[#1D4ED8] outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        {filteredStudents.length > 0 ? (
          <Table>
            <TableHead className="bg-gray-50 dark:bg-[#09090b]/50">
              <TableRow>
                <TableHeaderCell className="text-right">الطالب</TableHeaderCell>
                <TableHeaderCell className="text-right">تاريخ الانضمام</TableHeaderCell>
                <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {student.full_name ? student.full_name.charAt(0) : <Users size={18} />}
                      </div>
                      <div>
                        <Text className="font-bold text-gray-900 dark:text-white">{student.full_name || "بدون اسم"}</Text>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Text className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar size={14} /> 
                      <span style={{fontFamily: 'system-ui'}}>{new Date(student.created_at).toLocaleDateString('ar-SA')}</span>
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Badge color="emerald">مُفعل</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا يوجد طلاب!</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">لم يقم أي طالب بالتسجيل في المنصة حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
