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

export const getSpendingData = async (accountNumber: string): Promise<SpendingData> => {
  const response = await apiClient.get('/analytics/spending', {
    params: { accountNumber }
  });
  return response.data;
};

export const getMonthlyTrendsData = async (accountNumber: string): Promise<MonthlyTrendsData> => {
  const response = await apiClient.get('/analytics/monthly', {
    params: { accountNumber }
  });
  return response.data;
};