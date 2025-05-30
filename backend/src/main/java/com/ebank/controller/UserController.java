package com.ebank.controller;

import com.ebank.dto.PasswordChangeRequest;
import com.ebank.model.user.User;
import com.ebank.service.UserService;
import com.ebank.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing bank users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Create new user",
            description = "Registers a new user in the system",
            responses = {
                    @ApiResponse(responseCode = "201", description = "User created successfully"),
                    @ApiResponse(responseCode = "409", description = "Conflict - Username/Email already exists")
            }
    )
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userService.usernameExists(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
        if (userService.emailExists(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }
        User newUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get all users")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(
            summary = "Update user details",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User updated successfully"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!principal.getId().equals(id) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }


    @Operation(summary = "Delete user")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PatchMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest passwordChangeRequest,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!principal.getId().equals(id) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        userService.changePassword(id, passwordChangeRequest.getCurrentPassword(), passwordChangeRequest.getNewPassword());
        return ResponseEntity.ok("Password updated successfully");
    }


    @Operation(summary = "Toggle user status")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        userService.toggleUserStatus(id, enabled);
        String status = enabled ? "activated" : "deactivated";
        return ResponseEntity.ok("User account " + status + " successfully");
    }

    @Operation(summary = "Search user by username")
    @GetMapping("/search/username/{username}")
    public ResponseEntity<User> searchByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Search user by email")
    @GetMapping("/search/email/{email}")
    public ResponseEntity<User> searchByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }


}
