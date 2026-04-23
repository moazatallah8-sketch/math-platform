"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  Title, 
  Text, 
  BarChart, 
  DonutChart, 
  Flex, 
  Grid,
  Badge,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from "@tremor/react";
import { AlertCircle, Eye, MousePointerClick, Clock, Database, Info } from "lucide-react";
import { fetchAdvancedAnalytics } from "@/app/actions/analytics";

// Mock Data for Drop-off points
const videoDropOffData = [
  { "الدقيقة": "0:00 - 2:00", "الاحتفاظ": 100, "المغادرة": 0 },
  { "الدقيقة": "2:00 - 4:00", "الاحتفاظ": 95, "المغادرة": 5 },
  { "الدقيقة": "4:00 - 6:00", "الاحتفاظ": 88, "المغادرة": 7 },
  { "الدقيقة": "6:00 - 8:00", "الاحتفاظ": 65, "المغادرة": 23 }, // Drop-off spike
  { "الدقيقة": "8:00 - 10:00", "الاحتفاظ": 60, "المغادرة": 5 },
  { "الدقيقة": "10:00 - النهاية", "الاحتفاظ": 55, "المغادرة": 5 },
];

// Mock Data for Quizzes
const quizDifficultyData = [
  { name: "السؤال الأول (سهل)", "نسبة الخطأ": 12 },
  { name: "السؤال الثاني (متوسط)", "نسبة الخطأ": 35 },
  { name: "السؤال الثالث (صعب)", "نسبة الخطأ": 78 }, // High failure rate
  { name: "السؤال الرابع (متوسط)", "نسبة الخطأ": 22 },
];

export default function AnalyticsPage() {
  const [selectedCourse, setSelectedCourse] = useState("التفاضل والتكامل");
  const [hasRealData, setHasRealData] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchAdvancedAnalytics();
        setHasRealData(result.hasRealData || false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تحليلات السلوك المتقدمة</h1>
        <p className="text-gray-500 mt-1 text-sm">راقب نقاط التوقف في الفيديوهات التعليمية، وحلل صعوبة الاختبارات.</p>
      </div>

      {!hasRealData && isLoaded && (
        <Card decoration="left" decorationColor="blue" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Database className="text-blue-500 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100">وضع المحاكاة (لا توجد بيانات حقيقية بعد)</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                الرسوم البيانية المعروضة أدناه هي <strong className="font-bold">أرقام افتراضية للمعاينة</strong>. تم تجهيز البنية التحتية البرمجية بالكامل لتلقي أفعال الطلاب (Video Drop-offs و Quiz Attempts) من تطبيق الطالب. بمجرد أن يبدأ الطلاب في دراسة الكورسات، ستختفي هذه الرسالة وتظهر التحليلات الحقيقية تلقائياً.
              </p>
            </div>
          </div>
        </Card>
      )}

      <TabGroup>
        <TabList className="mt-4">
          <Tab icon={Eye}>الاحتفاظ بالمشاهدين (Video Drop-off)</Tab>
          <Tab icon={MousePointerClick}>أداء الاختبارات (Quiz Analytics)</Tab>
        </TabList>
        
        <TabPanels>
          {/* Video Analytics Panel */}
          <TabPanel>
            <Grid numItemsMd={1} numItemsLg={3} className="gap-6 mt-6">
              <Card className="lg:col-span-2">
                <Title>تحليل الاحتفاظ بالمشاهدين - درس {selectedCourse}</Title>
                <Text>يُظهر هذا الرسم البياني الدقائق التي يغادر فيها الطلاب الفيديو بشكل متكرر.</Text>
                <BarChart
                  className="mt-6 h-72"
                  data={videoDropOffData}
                  index="الدقيقة"
                  categories={["الاحتفاظ", "المغادرة"]}
                  colors={["emerald", "red"]}
                  yAxisWidth={48}
                  stack={true}
                  valueFormatter={(number) => `${number}%`}
                />
              </Card>
              
              <div className="space-y-6">
                <Card decoration="top" decorationColor="amber">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-500 shrink-0" />
                    <div>
                      <Title>تنبيه: نقطة توقف عالية</Title>
                      <Text className="mt-2 text-sm">
                        هناك <strong className="text-gray-900 dark:text-white">23%</strong> من الطلاب يغادرون الفيديو في <strong>الدقيقة 6:00</strong>. يُنصح بمراجعة هذا الجزء من الشرح لاحتمالية كونه معقداً أو مملاً.
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card>
                  <Title>إحصائيات المشاهدة</Title>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Flex className="gap-2 justify-start"><Clock size={18} className="text-gray-400" /><Text>متوسط مدة المشاهدة</Text></Flex>
                      <span className="font-semibold text-gray-900 dark:text-white">8:45 دقيقة</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Flex className="gap-2 justify-start"><Eye size={18} className="text-gray-400" /><Text>إجمالي المشاهدات</Text></Flex>
                      <span className="font-semibold text-gray-900 dark:text-white">1,420</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Grid>
          </TabPanel>

          {/* Quiz Analytics Panel */}
          <TabPanel>
            <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
              <Card>
                <Title>تحليل صعوبة الأسئلة (نسبة الخطأ)</Title>
                <Text>تعرف على الأسئلة التي يواجه الطلاب صعوبة في حلها.</Text>
                <BarChart
                  className="mt-6 h-72"
                  data={quizDifficultyData}
                  index="name"
                  categories={["نسبة الخطأ"]}
                  colors={["rose"]}
                  yAxisWidth={48}
                  valueFormatter={(number) => `${number}%`}
                />
              </Card>

              <Card decoration="top" decorationColor="rose">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" />
                  <div>
                    <Title>تنبيه: سؤال شديد الصعوبة</Title>
                    <Text className="mt-2 text-sm leading-relaxed">
                      <strong>السؤال الثالث</strong> يمتلك نسبة خطأ تصل إلى <strong className="text-red-500">78%</strong>!
                      <br/><br/>
                      <strong>التوصية:</strong> قم بإرسال إشعار للطلاب بمراجعة درس "قواعد الاشتقاق" المرتبط بهذا السؤال، أو قم بتسجيل فيديو قصير لحل هذا السؤال تحديداً.
                    </Text>
                  </div>
                </div>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>

    </div>
  );
}
