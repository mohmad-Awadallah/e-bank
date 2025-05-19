package com.ebank.service.impl;

import com.ebank.model.transaction.Transaction;
import com.ebank.repository.TransactionRepository;
import com.ebank.service.AnalyticsService;
import com.ebank.service.CacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final CacheService cacheService;

    @Override
    public Map<String, Object> getSpendingBreakdown() {
        String cacheKey = "spending-breakdown";
        Map<String, Object> cachedData = cacheService.getCachedData(cacheKey, Map.class);

        if (cachedData != null) {
            return cachedData;
        }

        List<Transaction> transactions = transactionRepository.findAll();

        Map<String, Double> spendingByType = transactions.stream()
                .collect(Collectors.groupingBy(
                        tx -> tx.getType().name(),
                        Collectors.summingDouble(tx -> tx.getAmount().doubleValue())
                ));

        Map<String, Object> result = Map.of(
                "labels", new ArrayList<>(spendingByType.keySet()),
                "values", new ArrayList<>(spendingByType.values())
        );

        cacheService.cacheData(cacheKey, result, Map.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);

        return result;
    }

    @Override
    public Map<String, Object> getMonthlyTrends() {
        String cacheKey = "monthly-trends";
        Map<String, Object> cachedData = cacheService.getCachedData(cacheKey, Map.class);

        if (cachedData != null) {
            return cachedData;
        }

        List<Transaction> transactions = transactionRepository.findAll();

        Map<String, Double> monthlyTotals = transactions.stream()
                .filter(tx -> tx.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        tx -> tx.getCreatedAt().getMonth()
                                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        TreeMap::new,
                        Collectors.summingDouble(tx -> tx.getAmount().doubleValue())
                ));

        Map<String, Object> result = Map.of(
                "labels", new ArrayList<>(monthlyTotals.keySet()),
                "values", new ArrayList<>(monthlyTotals.values())
        );

        cacheService.cacheData(cacheKey, result, Map.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);

        return result;
    }

}
