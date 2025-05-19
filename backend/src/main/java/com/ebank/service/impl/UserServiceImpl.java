package com.ebank.service.impl;

import com.ebank.model.user.User;
import com.ebank.repository.UserRepository;
import com.ebank.service.CacheService;
import com.ebank.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CacheService cacheService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           CacheService cacheService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cacheService = cacheService;
    }

    @Override
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }



    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        String cacheKey = "user:" + id;
        User cachedUser = cacheService.getCachedData(cacheKey, User.class);

        if (cachedUser != null) {
            return Optional.of(cachedUser);
        }

        Optional<User> user = userRepository.findById(id);
        user.ifPresent(u -> {
            cacheService.cacheData(cacheKey, u, User.class);
            cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);
        });
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        String cacheKey = "user:username:" + username;
        User cachedUser = cacheService.getCachedData(cacheKey, User.class);

        if (cachedUser != null) {
            return Optional.of(cachedUser);
        }

        Optional<User> user = userRepository.findByUsername(username);
        user.ifPresent(u -> {
            cacheService.cacheData(cacheKey, u, User.class);
            cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);
        });
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        String cacheKey = "user:email:" + email;
        User cachedUser = cacheService.getCachedData(cacheKey, User.class);

        if (cachedUser != null) {
            return Optional.of(cachedUser);
        }

        Optional<User> user = userRepository.findByEmail(email);
        user.ifPresent(u -> {
            cacheService.cacheData(cacheKey, u, User.class);
            cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);
        });
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    @Override
    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    if (userDetails.getFirstName() != null) existingUser.setFirstName(userDetails.getFirstName());
                    if (userDetails.getLastName()  != null) existingUser.setLastName(userDetails.getLastName());
                    if (userDetails.getUsername()  != null) existingUser.setUsername(userDetails.getUsername());
                    if (userDetails.getEmail()     != null) existingUser.setEmail(userDetails.getEmail());
                    if (userDetails.getPassword()  != null && !userDetails.getPassword().isBlank()) {
                        existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    if (userDetails.getRole()      != null) existingUser.setRole(userDetails.getRole());
                    existingUser.setEnabled(userDetails.isEnabled());
                    if (userDetails.getPhoneNumber() != null) existingUser.setPhoneNumber(userDetails.getPhoneNumber());

                    evictUserCache(existingUser);
                    User saved = userRepository.save(existingUser);
                    cacheService.cacheData("user:" + saved.getId(), saved, User.class);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }


    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        userRepository.findById(userId)
                .ifPresent(user -> {
                    if (passwordEncoder.matches(currentPassword, user.getPassword())) {
                        user.setPassword(passwordEncoder.encode(newPassword));
                        evictUserCache(user);
                        userRepository.save(user);
                    } else {
                        throw new IllegalArgumentException("Current password is incorrect.");
                    }
                });
    }


    @Override
    public void toggleUserStatus(Long userId, boolean enabled) {
        userRepository.findById(userId)
                .ifPresent(user -> {
                    user.setEnabled(enabled);
                    evictUserCache(user);
                    userRepository.save(user);
                });
    }

    private void evictUserCache(User user) {
        cacheService.evictUserCache("user:" + user.getId());
        cacheService.evictUserCache("user:username:" + user.getUsername());
        cacheService.evictUserCache("user:email:" + user.getEmail());
    }
}