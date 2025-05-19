// src/services/analytics.ts
import apiClient from '@/lib/apiClient';

// واجهة البيانات للإنفاق
export interface SpendingData {
  labels: string[];
  values: number[];
}

// واجهة البيانات للاتجاهات الشهرية
export interface MonthlyTrendsData {
  labels: string[];
  values: number[];
}

// جلب بيانات تحليل الإنفاق
export const getSpendingData = async (): Promise<SpendingData> => {
  try {
    const response = await apiClient.get('/analytics/spending');
    return response.data;
  } catch (error) {
    console.error('Error fetching spending data:', error);
    throw new Error('Failed to fetch spending data');
  }
};

// جلب بيانات الاتجاهات الشهرية
export const getMonthlyTrendsData = async (): Promise<MonthlyTrendsData> => {
  try {
    const response = await apiClient.get('/analytics/monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trends data:', error);
    throw new Error('Failed to fetch monthly trends data');
  }
};
