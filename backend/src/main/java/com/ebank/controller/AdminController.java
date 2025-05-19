package com.ebank.controller;

import com.ebank.model.user.User;
import com.ebank.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/users/recent")
    public ResponseEntity<List<User>> getRecentUsers(
            @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(adminService.getRecentUsers(count));
    }
}