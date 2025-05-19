package com.ebank.service;

import java.util.Map;

public interface AnalyticsService {
    Map<String, Object> getSpendingBreakdown();
    Map<String, Object> getMonthlyTrends();
}
