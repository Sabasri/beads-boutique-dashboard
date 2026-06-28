import api from './api';

export const getOverviewData = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const getSalesTrend = async (type = 'monthly') => {
  const response = await api.get('/analytics/sales-trend', { params: { type } });
  return response.data;
};

export const getProductPerformance = async () => {
  const response = await api.get('/analytics/product-performance');
  return response.data;
};

export const getRevenueDistribution = async () => {
  const response = await api.get('/analytics/revenue-distribution');
  return response.data;
};

export const getAdvancedAnalytics = async () => {
  const response = await api.get('/analytics/advanced');
  return response.data;
};
