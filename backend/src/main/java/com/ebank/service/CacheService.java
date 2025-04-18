package com.ebank.service;

import java.util.concurrent.TimeUnit;

public interface CacheService {
    // عمليات التخزين المؤقت للمستخدمين
    void cacheUserDetails(String key, Object value);
    Object getCachedUserDetails(String key);
    void evictUserCache(String key);

    // عمليات التخزين المؤقت للحسابات
    void cacheAccountDetails(String key, Object value);
    Object getCachedAccountDetails(String key);
    void evictAccountCache(String key);

    // عمليات عامة للتخزين المؤقت
    <T> void cacheData(String key, T value, Class<T> type);
    <T> T getCachedData(String key, Class<T> type);

    // إدارة صلاحية البيانات
    void setExpiration(String key, long timeout, TimeUnit unit);

    // أدوات مساعدة
    boolean hasKey(String key);
    void clearAllCaches();
}