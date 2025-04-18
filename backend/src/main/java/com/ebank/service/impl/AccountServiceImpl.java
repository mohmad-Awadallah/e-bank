package com.ebank.service.impl;

import com.ebank.dto.*;
import com.ebank.exception.*;
import com.ebank.model.account.*;
import com.ebank.model.user.Role;
import com.ebank.model.user.User;
import com.ebank.repository.AccountRepository;
import com.ebank.repository.UserRepository;
import com.ebank.service.AccountService;
import com.ebank.service.CacheService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ebank.exception.UserNotFoundException;
import com.ebank.exception.AccountNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CacheService cacheService;

    @Override
    public AccountDTO createAccount(AccountCreationDTO accountCreationDTO) {
        User user = userRepository.findById(accountCreationDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException(accountCreationDTO.getUserId()));

        Account account = modelMapper.map(accountCreationDTO, Account.class);
        account.setUser(user);
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);

        Account savedAccount = accountRepository.save(account);
        log.info("Created new account with ID: {}", savedAccount.getId());

        return modelMapper.map(savedAccount, AccountDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountDetailsDTO getAccountDetails(Long accountId) {
        String cacheKey = "account:details:" + accountId;
        AccountDetailsDTO cached = cacheService.getCachedData(cacheKey, AccountDetailsDTO.class);

        if (cached != null) return cached;

        Account account = getAccountById(accountId);
        AccountDetailsDTO dto = modelMapper.map(account, AccountDetailsDTO.class);

        cacheService.cacheData(cacheKey, dto, AccountDetailsDTO.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountDTO> getAllAccounts(Pageable pageable) {
        return accountRepository.findAll(pageable)
                .map(account -> modelMapper.map(account, AccountDTO.class));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountDTO> getUserAccounts(Long userId) {
        String cacheKey = "user:accounts:" + userId;
        List<AccountDTO> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<AccountDTO> accounts = accountRepository.findByUserId(userId)
                .stream()
                .map(account -> modelMapper.map(account, AccountDTO.class))
                .collect(Collectors.toList());

        cacheService.cacheData(cacheKey, accounts, List.class);
        cacheService.setExpiration(cacheKey, 1, TimeUnit.HOURS);

        return accounts;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getAccountBalance(Long accountId) {
        String cacheKey = "account:balance:" + accountId;
        BigDecimal cachedBalance = cacheService.getCachedData(cacheKey, BigDecimal.class);

        if (cachedBalance != null) return cachedBalance;

        BigDecimal balance = getAccountById(accountId).getBalance();

        cacheService.cacheData(cacheKey, balance, BigDecimal.class);
        cacheService.setExpiration(cacheKey, 5, TimeUnit.MINUTES);

        return balance;
    }

    @Override
    public void deposit(Long accountId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Deposit amount must be positive");
        }

        Account account = getAccountById(accountId);
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        log.info("Deposited {} to account ID: {}", amount, accountId);
        evictAccountCache(account);
    }

    @Override
    public void withdraw(Long accountId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be positive");
        }

        Account account = getAccountById(accountId);

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(accountId, amount);
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
        log.info("Withdrew {} from account ID: {}", amount, accountId);
        evictAccountCache(account);
    }

    @Override
    public void transfer(Long sourceAccountId, Long targetAccountId, BigDecimal amount) {
        withdraw(sourceAccountId, amount);
        deposit(targetAccountId, amount);
        log.info("Transferred {} from account {} to account {}", amount, sourceAccountId, targetAccountId);
    }

    @Override
    public void deactivateAccount(Long accountId) {
        updateAccountStatus(accountId, AccountStatus.INACTIVE);
    }

    @Override
    public void activateAccount(Long accountId) {
        updateAccountStatus(accountId, AccountStatus.ACTIVE);
    }

    @Override
    public void updateAccountStatus(Long accountId, AccountStatus status) {
        Account account = getAccountById(accountId);
        account.setStatus(status); // █ هنا يتم استخدام AccountStatus مباشرةً
        accountRepository.save(account);
        log.info("Updated status of account ID: {} to {}", accountId, status.name());
        evictAccountCache(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountDTO> searchAccounts(String searchTerm) {
        String cacheKey = "account:search:" + searchTerm.hashCode();
        List<AccountDTO> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<AccountDTO> results = accountRepository.search(searchTerm)
                .stream()
                .map(account -> modelMapper.map(account, AccountDTO.class))
                .collect(Collectors.toList());

        cacheService.cacheData(cacheKey, results, List.class);
        cacheService.setExpiration(cacheKey, 10, TimeUnit.MINUTES);

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountDTO> getAccountsByType(String accountType) {
        return accountRepository.findByAccountType(AccountType.valueOf(accountType.toUpperCase())).stream()
                .map(account -> modelMapper.map(account, AccountDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void updateAccountDetails(Long accountId, AccountDTO accountDTO) {
        Account account = getAccountById(accountId);
        modelMapper.map(accountDTO, account);
        accountRepository.save(account);
        log.info("Updated details for account ID: {}", accountId);
    }

    private Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(String.valueOf(accountId)));

    }

    @PostConstruct
    public void configureModelMapper() {
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true);

        // حل بديل أكثر أمانًا
        TypeMap<User, UserDTO> typeMap = modelMapper.createTypeMap(User.class, UserDTO.class);

        // تعيين الحقول الأساسية
        typeMap.addMapping(User::getId, UserDTO::setId);
        typeMap.addMapping(User::getUsername, UserDTO::setUsername);
        typeMap.addMapping(User::getEmail, UserDTO::setEmail);
        typeMap.addMapping(User::getFirstName, UserDTO::setFirstName);
        typeMap.addMapping(User::getLastName, UserDTO::setLastName);
        typeMap.addMapping(User::getPhoneNumber, UserDTO::setPhoneNumber);
        typeMap.addMapping(User::isEnabled, UserDTO::setEnabled);

        // تعيين خاص للـ Role
        typeMap.addMappings(mapper -> {
            mapper.using(ctx -> ((Role) ctx.getSource()).name())
                    .map(User::getRole, UserDTO::setRole);
        });
    }

    private void evictAccountCache(Account account) {
        cacheService.evictAccountCache("account:details:" + account.getId());
        cacheService.evictAccountCache("account:balance:" + account.getId());
        cacheService.evictAccountCache("user:accounts:" + account.getUser().getId());
    }
}
