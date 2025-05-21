package com.ebank.service.impl;

import com.ebank.dto.*;
import com.ebank.exception.*;
import com.ebank.model.account.*;
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
        if (accountRepository.existsByAccountNumber(accountCreationDTO.getAccountNumber())) {
            throw new DuplicateAccountException("Account number already exists: " + accountCreationDTO.getAccountNumber());
        }

        User user = userRepository.findById(accountCreationDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException(accountCreationDTO.getUserId()));

        Account account = modelMapper.map(accountCreationDTO, Account.class);
        account.setUser(user);
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);

        Account savedAccount = accountRepository.save(account);

        AccountDTO savedDTO = modelMapper.map(savedAccount, AccountDTO.class);

        savedDTO.setBalance(savedAccount.getBalance());
        savedDTO.setAccountName(savedAccount.getAccountName());
        savedDTO.setCurrency(savedAccount.getCurrency());
        savedDTO.setAccountType(savedAccount.getAccountType());
        savedDTO.setStatus(savedAccount.getStatus());

        String userAccountsCacheKey = "user:accounts:" + user.getId();
        cacheService.evictAccountCache(userAccountsCacheKey);

        List<AccountDTO> updatedAccounts = accountRepository.findByUserId(user.getId())
                .stream()
                .map(acc -> modelMapper.map(acc, AccountDTO.class))
                .collect(Collectors.toList());
        cacheService.cacheData(userAccountsCacheKey, updatedAccounts, List.class);
        cacheService.setExpiration(userAccountsCacheKey, 1, TimeUnit.HOURS);

        return savedDTO;
    }



    @Override
    @Transactional(readOnly = true)
    public AccountDetailsDTO getAccountDetails(Long accountId) {
        String cacheKey = "account:details:" + accountId;
        AccountDetailsDTO cached = cacheService.getCachedData(cacheKey, AccountDetailsDTO.class);

        if (cached != null) {
            log.debug("CACHE HIT for key {}", cacheKey);
            return cached;
        }

        log.debug("CACHE MISS for key {}, loading from DB", cacheKey);
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

        // 1. جلب الحساب وحساب الرصيد الجديد
        Account account = getAccountById(accountId);
        BigDecimal newBalance = account.getBalance().add(amount);
        account.setBalance(newBalance);

        // 2. حفظ التغيير في قاعدة البيانات
        Account updated = accountRepository.save(account);
        log.info("Deposited {} to account ID: {}", amount, accountId);

        // 3. تحديث كاش الرصيد
        String balanceKey = "account:balance:" + accountId;
        cacheService.cacheData(balanceKey, newBalance, BigDecimal.class);
        cacheService.setExpiration(balanceKey, 5, TimeUnit.MINUTES);

        // 4. إعادة تعبئة كاش تفاصيل الحساب
        String detailsKey = "account:details:" + accountId;
        AccountDetailsDTO dto = modelMapper.map(updated, AccountDetailsDTO.class);
        cacheService.cacheData(detailsKey, dto, AccountDetailsDTO.class);
        cacheService.setExpiration(detailsKey, 30, TimeUnit.MINUTES);

        // 5. **إعادة تعبئة** كاش قائمة حسابات المستخدم بالكامل
        Long userId = account.getUser().getId();
        String userAccountsKey = "user:accounts:" + userId;

        List<AccountDTO> updatedAccounts = accountRepository.findByUserId(userId)
                .stream()
                .map(acc -> modelMapper.map(acc, AccountDTO.class))
                .collect(Collectors.toList());
        cacheService.cacheData(userAccountsKey, updatedAccounts, List.class);
        cacheService.setExpiration(userAccountsKey, 1, TimeUnit.HOURS);
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
        Account updatedAccount = accountRepository.save(account);
        log.info("Withdrew {} from account ID: {}", amount, accountId);

        String balanceKey = "account:balance:" + accountId;
        cacheService.cacheData(balanceKey, updatedAccount.getBalance(), BigDecimal.class);
        cacheService.setExpiration(balanceKey, 5, TimeUnit.MINUTES);

        String detailsKey = "account:details:" + accountId;
        AccountDetailsDTO updatedAccountDetails = modelMapper.map(updatedAccount, AccountDetailsDTO.class);
        cacheService.cacheData(detailsKey, updatedAccountDetails, AccountDetailsDTO.class);
        cacheService.setExpiration(detailsKey, 30, TimeUnit.MINUTES);

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
    @Transactional(readOnly = true)
    public AccountDetailsDTO getAccountByNumber(String accountNumber) {
        String cacheKey = "account:details:" + accountNumber;
        AccountDetailsDTO cached = cacheService.getCachedData(cacheKey, AccountDetailsDTO.class);
        if (cached != null) return cached;

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));

        AccountDetailsDTO dto = modelMapper.map(account, AccountDetailsDTO.class);
        cacheService.cacheData(cacheKey, dto, AccountDetailsDTO.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);
        return dto;
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
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
    }

    @PostConstruct
    public void configureModelMapper() {
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true);


        TypeMap<Account, AccountDetailsDTO> detailsMap =
                modelMapper.createTypeMap(Account.class, AccountDetailsDTO.class);

        detailsMap.addMapping(Account::getId,              AccountDetailsDTO::setId);
        detailsMap.addMapping(Account::getAccountNumber,   AccountDetailsDTO::setAccountNumber);
        detailsMap.addMapping(Account::getAccountName,     AccountDetailsDTO::setAccountName);
        detailsMap.addMapping(Account::getCurrency,        AccountDetailsDTO::setCurrency);
        detailsMap.addMapping(Account::getAccountType,     AccountDetailsDTO::setAccountType);
        detailsMap.addMapping(Account::getStatus,          AccountDetailsDTO::setStatus);
        detailsMap.addMapping(Account::getBalance,         AccountDetailsDTO::setBalance);

    }


    private void evictAccountCache(Account account) {
        cacheService.evictAccountCache("account:details:" + account.getId());
        cacheService.evictAccountCache("account:balance:" + account.getId());
        cacheService.evictAccountCache("user:accounts:" + account.getUser().getId());
    }
}
