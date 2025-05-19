package com.ebank.service;

import com.ebank.model.user.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserById(Long id);
    Optional<User> getUserByUsername(String username);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUser(Long id, User userDetails);
    void deleteUser(Long id);
    boolean usernameExists(String username);
    boolean emailExists(String email);
    void changePassword(Long userId, String currentPassword, String newPassword);
    void toggleUserStatus(Long userId, boolean enabled);
}