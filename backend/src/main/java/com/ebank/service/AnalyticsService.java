package com.ebank.service;

import java.util.Map;

public interface AnalyticsService {

    Map<String, Object> getSpendingBreakdown(String accountNumber);
    Map<String, Object> getMonthlyTrends(String accountNumber);

}
