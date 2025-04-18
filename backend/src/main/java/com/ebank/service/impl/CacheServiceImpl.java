package com.ebank.service.impl;

import com.ebank.service.CacheService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class CacheServiceImpl implements CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(CacheServiceImpl.class);


    public CacheServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public <T> T getCachedData(String key, Class<T> type) {
        String prefixedKey = type.getSimpleName().toLowerCase() + ":" + key;
        try {
            Object value = redisTemplate.opsForValue().get(prefixedKey);
            return type.cast(value);
        } catch (Exception e) {
            logger.error("Error retrieving cached data for key {}: {}", prefixedKey, e.getMessage());
            return null;
        }
    }

    @Override
    public void cacheUserDetails(String key, Object value) {
        String prefixedKey = "user:" + key;
        redisTemplate.opsForValue().set(prefixedKey, value);
        redisTemplate.expire(prefixedKey, 30, TimeUnit.MINUTES);
    }

    @Override
    public Object getCachedUserDetails(String key) {
        return redisTemplate.opsForValue().get("user:" + key);
    }

    @Override
    public void evictUserCache(String key) {
        redisTemplate.delete("user:" + key);
    }

    @Override
    public void cacheAccountDetails(String key, Object value) {
        String prefixedKey = "account:" + key;
        redisTemplate.opsForValue().set(prefixedKey, value);
        redisTemplate.expire(prefixedKey, 30, TimeUnit.MINUTES);
    }

    @Override
    public Object getCachedAccountDetails(String key) {
        return redisTemplate.opsForValue().get("account:" + key);
    }

    @Override
    public void evictAccountCache(String key) {
        redisTemplate.delete("account:" + key);
    }

    @Override
    public <T> void cacheData(String key, T value, Class<T> type) {
        String prefixedKey = type.getSimpleName().toLowerCase() + ":" + key;
        redisTemplate.opsForValue().set(prefixedKey, value);
        redisTemplate.expire(prefixedKey, 30, TimeUnit.MINUTES);
    }


    @Override
    public void setExpiration(String key, long timeout, TimeUnit unit) {
        redisTemplate.expire(key, timeout, unit);
    }

    @Override
    public boolean hasKey(String key) {
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    @Override
    public void clearAllCaches() {
        redisTemplate.getConnectionFactory().getConnection().flushDb();
    }
}