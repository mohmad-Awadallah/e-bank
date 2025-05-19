import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { useEffect, useState } from 'react';
import { getSpendingData, getMonthlyTrendsData } from '@/services/analytics'; // استيراد الخدمات الجديدة
import { FaChartPie, FaChartLine } from 'react-icons/fa'; 
import LoadingScreen from '@/components/common/LoadingScreen';


// إضافة المكونات اللازمة لـ Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

export function AnalyticsSection({ accountNumber }: { accountNumber: string }) {
  const [spendingData, setSpendingData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  useEffect(() => {
    if (!accountNumber) return;

    getSpendingData(accountNumber)
      .then(setSpendingData)
      .catch(console.error);

    getMonthlyTrendsData(accountNumber)
      .then(setMonthlyData)
      .catch(console.error);
  }, [accountNumber]);

  if (!spendingData || !monthlyData) {
    return <LoadingScreen />;
  }

  // بيانات المخطط الدائري (Spending Breakdown)
  const pieData = {
    labels: spendingData.labels,
    datasets: [
      {
        data: spendingData.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // بيانات المخطط الخطي (Monthly Trends)
  const lineData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Expenses',
        data: monthlyData.values,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Spending Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaChartPie className="mr-2" />
          Spending Breakdown
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <Pie data={pieData} />
        </div>
      </div>
      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaChartLine className="mr-2" />
          Monthly Trends
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
