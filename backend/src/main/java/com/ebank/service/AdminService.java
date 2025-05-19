package com.ebank.service;


import com.ebank.model.user.User;

import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String, Object> getSystemStats();
    List<User> getRecentUsers(int count);
}
