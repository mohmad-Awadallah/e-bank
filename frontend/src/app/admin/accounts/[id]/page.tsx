// app/admin/accounts/[id]/page.tsx



"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, ChevronLeft, Plus, Loader2, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import userService from '@/services/user';
import { getUserTransactions } from '@/services/transaction';
import {
    issueCreditCard,
    getAccountCards,
    CardType,
    CreditCardResponseDTO,
    deactivateCreditCard,
} from '@/services/credit-cards';
import {
    getUserAccounts,
    activateAccount,
    deactivateAccount,
} from '@/services/account';
import {
    createBillPayment,
    getPaymentHistory,
    deleteBillPayment,
    BillPayment,
} from '@/services/bill-payment';
import {
    getUserWallets,
    createWallet,
    deleteWallet,
    updateWalletPhoneNumber,
    verifyWallet,
    WalletDTO,
    WalletType
} from '@/services/wallet';
import { Account } from '@/types/auth';

import {
    Button,
    Input,
    Label,
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Skeleton,
} from '@/components/ui';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Transaction {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    date: string;
    sourceAccountNumber: string;
    targetAccountNumber: string;
    description?: string;
}


const MIN_CREDIT_LIMIT = 100;

export default function AccountDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const userId = Number(id);

    // State
    const [user, setUser] = useState<User | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
    const [creditCards, setCreditCards] = useState<CreditCardResponseDTO[]>([]);
    const [wallets, setWallets] = useState<WalletDTO[]>([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<User>>({});

    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [newBillPayment, setNewBillPayment] = useState({
        billerCode: '',
        amount: 0,
        description: ''
    });

    const [cardsLoading, setCardsLoading] = useState(false);
    const [showIssueDialog, setShowIssueDialog] = useState(false);
    const [cardType, setCardType] = useState<CardType | ''>('');
    const [creditLimit, setCreditLimit] = useState<number>(0);

    // Wallet states
    const [showWalletDialog, setShowWalletDialog] = useState(false);
    const [newWallet, setNewWallet] = useState({
        walletType: '' as WalletType | '',
        phoneNumber: ''
    });
    const WALLET_TYPES = ['APPLE_PAY', 'GOOGLE_PAY', 'SAMSUNG_PAY', 'PAYPAL', 'OTHER'] as const;
    const [verificationCode, setVerificationCode] = useState('');
    const [walletToVerify, setWalletToVerify] = useState<number | null>(null);
    const [phoneError, setPhoneError] = useState('');


    // Data fetching
    const fetchUserAndAccounts = useCallback(async () => {
        try {
            setLoading(true);
            const [userData, accountsData, walletsData] = await Promise.all([
                userService.getUserById(userId),
                getUserAccounts(String(userId)),
                getUserWallets(userId)
            ]);

            setUser(userData);
            setEditData({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
            });

            setAccounts(accountsData);
            setWallets(walletsData);
            if (accountsData.length) {
                setSelectedAccountId(accountsData[0].id.toString());
            }
        } catch (error) {
            toast.error('Failed to load user data');
            console.error('Fetch user error:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchTransactions = useCallback(async () => {
        try {
            const data = await getUserTransactions(userId);
            setTransactions(data);
        } catch (error) {
            toast.error('Failed to load transactions');
            console.error('Fetch transactions error:', error);
        }
    }, [userId]);

    const fetchAccountData = useCallback(async () => {
        if (!selectedAccountId) return;

        try {
            const [paymentsData, cardsData] = await Promise.all([
                getPaymentHistory(selectedAccountId),
                getAccountCards(Number(selectedAccountId))
            ]);

            setBillPayments(paymentsData);
            setCreditCards(cardsData);
        } catch (error) {
            toast.error('Failed to load account data');
            console.error('Fetch account data error:', error);
        }
    }, [selectedAccountId]);

    // Initial data load
    useEffect(() => {
        fetchUserAndAccounts();
        fetchTransactions();
    }, [fetchUserAndAccounts, fetchTransactions]);

    // Account-specific data load
    useEffect(() => {
        if (selectedAccountId) {
            fetchAccountData();
        }
    }, [selectedAccountId, fetchAccountData]);

    // Handlers
    const handleToggleAccount = async (account: Account) => {
        setActionLoading(account.id);
        try {
            if (account.status === 'ACTIVE') {
                await deactivateAccount(String(account.id));
            } else {
                await activateAccount(String(account.id));
            }
            toast.success('Account status updated');
            setAccounts(await getUserAccounts(String(userId)));
        } catch (error) {
            toast.error('Failed to update account status');
            console.error('Toggle account error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveUser = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await userService.updateUser(userId, editData);
            toast.success('User updated successfully');
            setIsEditing(false);
            fetchUserAndAccounts();
        } catch (error) {
            toast.error('Failed to update user');
            console.error('Save user error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayment = async () => {
        if (!selectedAccountId) {
            toast.error('Please select an account first');
            return;
        }

        try {
            const payment = await createBillPayment({
                accountId: selectedAccountId,
                ...newBillPayment
            });

            setBillPayments(prev => [payment, ...prev]);
            toast.success('Payment created successfully');
            setShowPaymentDialog(false);
            setNewBillPayment({ billerCode: '', amount: 0, description: '' });
        } catch (error) {
            toast.error('Failed to create payment');
            console.error('Create payment error:', error);
        }
    };

    const handleDeletePayment = async (id: string) => {
        try {
            await deleteBillPayment(id);
            setBillPayments(prev => prev.filter(p => p.id !== id));
            toast.success('Payment deleted successfully');
        } catch (error) {
            toast.error('Failed to delete payment');
            console.error('Delete payment error:', error);
        }
    };

    const handleIssueCard = async () => {
        if (!cardType || creditLimit < MIN_CREDIT_LIMIT || !user) {
            toast.error('Please provide valid card details');
            return;
        }

        setActionLoading('issuing');
        try {
            await issueCreditCard({
                accountId: Number(selectedAccountId),
                cardHolderName: `${user.firstName} ${user.lastName}`,
                cardType: cardType as CardType,
                creditLimit,
            });

            toast.success('Credit card issued successfully');
            setShowIssueDialog(false);
            setCardType('');
            setCreditLimit(0);
            fetchAccountData();
        } catch (error) {
            toast.error('Failed to issue credit card');
            console.error('Issue card error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeactivateCard = async (cardId: number) => {
        setActionLoading(cardId);
        try {
            await deactivateCreditCard(cardId);
            toast.success('Card deactivated successfully');
            fetchAccountData();
        } catch (error) {
            toast.error('Failed to deactivate card');
            console.error('Deactivate card error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Wallet handlers
    const handleCreateWallet = async () => {
        if (!newWallet.walletType || !newWallet.phoneNumber) {
            toast.error('Please fill all fields');
            return;
        }

        setActionLoading('creating-wallet');
        try {
            const createdWallet = await createWallet({
                userId,
                walletType: newWallet.walletType as WalletType,
                phoneNumber: newWallet.phoneNumber
            });

            toast.success('Wallet created successfully. Please verify it.');
            setWallets(prev => [...prev, createdWallet]);
            setShowWalletDialog(false);
            setNewWallet({ walletType: '', phoneNumber: '' });

            // Set the wallet for verification
            setWalletToVerify(createdWallet.id);
        } catch (error) {
            toast.error('Failed to create wallet');
            console.error('Create wallet error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleVerifyWallet = async () => {
        if (!walletToVerify || !verificationCode) return;

        setActionLoading('verifying-wallet');
        try {
            const verifiedWallet = await verifyWallet(walletToVerify, verificationCode);
            setWallets(prev => prev.map(w =>
                w.id === walletToVerify ? verifiedWallet : w
            ));
            toast.success('Wallet verified successfully');
            setWalletToVerify(null);
            setVerificationCode('');
        } catch (error) {
            toast.error('Failed to verify wallet');
            console.error('Verify wallet error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteWallet = async (walletId: number) => {
        setActionLoading(walletId);
        try {
            await deleteWallet(walletId);
            setWallets(prev => prev.filter(w => w.id !== walletId));
            toast.success('Wallet deleted successfully');
        } catch (error) {
            toast.error('Failed to delete wallet');
            console.error('Delete wallet error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateWalletPhone = async (walletId: number, newPhone: string) => {
        setActionLoading(`update-phone-${walletId}`);
        try {
            const updatedWallet = await updateWalletPhoneNumber(walletId, newPhone);
            setWallets(prev => prev.map(w =>
                w.id === walletId ? updatedWallet : w
            ));
            toast.success('Phone number updated successfully');
        } catch (error) {
            toast.error('Failed to update phone number');
            console.error('Update wallet phone error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, '');
        setNewWallet({ ...newWallet, phoneNumber: input });

        if (input.length !== 10) {
            setPhoneError('Phone number must be exactly 10 digits.');
        } else if (!input.startsWith('0')) {
            setPhoneError('Phone number must start with 0.');
        } else {
            setPhoneError('');
        }
    };

    // Loading states
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <Skeleton className="h-10 w-24" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                User not found
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSaveUser}>
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* User Details */}
            <section>
                <h2 className="text-xl font-semibold mb-4">User Details</h2>
                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>First Name</Label>
                            <Input
                                value={editData.firstName || ''}
                                onChange={(e) => setEditData(d => ({ ...d, firstName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input
                                value={editData.lastName || ''}
                                onChange={(e) => setEditData(d => ({ ...d, lastName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={editData.email || ''}
                                onChange={(e) => setEditData(d => ({ ...d, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                type="tel"
                                value={editData.phoneNumber || ''}
                                onChange={(e) => setEditData(d => ({ ...d, phoneNumber: e.target.value }))}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Detail label="Name" value={`${user.firstName} ${user.lastName}`} />
                        <Detail label="Username" value={user.username} />
                        <Detail label="Email" value={user.email} />
                        <Detail label="Phone" value={user.phoneNumber} />
                        <Detail
                            label="Role"
                            value={<Badge>{user.role.replace('ROLE_', '')}</Badge>}
                        />
                        <Detail
                            label="Status"
                            value={
                                <Badge variant={user.enabled ? 'success' : 'destructive'}>
                                    {user.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            }
                        />
                    </div>
                )}
            </section>

            {/* Accounts Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Accounts</h2>
                {accounts.length === 0 ? (
                    <p className="text-gray-500">No accounts found</p>
                ) : (
                    <ul className="space-y-4">
                        {accounts.map((account) => (
                            <li key={account.id} className="border p-4 rounded-lg">
                                <div className="grid grid-cols-3 gap-4">
                                    <Info label="Number" value={account.accountNumber} />
                                    <Info
                                        label="Balance"
                                        value={`${account.currency} ${account.balance.toFixed(2)}`}
                                    />
                                    <Info
                                        label="Status"
                                        value={
                                            <Badge variant={account.status === 'ACTIVE' ? 'success' : 'destructive'}>
                                                {account.status}
                                            </Badge>
                                        }
                                    />
                                </div>
                                <div className="mt-4 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleAccount(account)}
                                        disabled={actionLoading === account.id}
                                        className={
                                            account.status === 'ACTIVE'
                                                ? 'border-red-500 text-red-500 hover:bg-red-50'
                                                : 'border-green-500 text-green-500 hover:bg-green-50'
                                        }
                                    >
                                        {actionLoading === account.id ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : account.status === 'ACTIVE' ? (
                                            'Deactivate'
                                        ) : (
                                            'Activate'
                                        )}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Wallets Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Digital Wallets</h2>
                <div className="mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowWalletDialog(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Wallet
                    </Button>
                </div>

                <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Digital Wallet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Select
                                value={newWallet.walletType}
                                onValueChange={(val) => setNewWallet({ ...newWallet, walletType: val as WalletType })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select wallet type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {WALLET_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="tel"
                                placeholder="Phone Number"
                                value={newWallet.phoneNumber}
                                onChange={handlePhoneNumberChange}
                            />
                            {phoneError && (
                                <p className="text-sm text-red-500">{phoneError}</p>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowWalletDialog(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCreateWallet}
                                    disabled={
                                        !newWallet.walletType || !newWallet.phoneNumber || !!phoneError
                                    }
                                >
                                    {actionLoading === 'creating-wallet' ? (
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    ) : null}
                                    Create Wallet
                                </Button>

                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={walletToVerify !== null} onOpenChange={(open) => !open && setWalletToVerify(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Verify Wallet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setWalletToVerify(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleVerifyWallet}
                                    disabled={!verificationCode}
                                >
                                    {actionLoading === 'verifying-wallet' ? (
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    ) : null}
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {wallets.length === 0 ? (
                    <p className="text-gray-500">No wallets found</p>
                ) : (
                    <ul className="space-y-3">
                        {wallets.map((wallet) => (
                            <li key={wallet.id} className="border p-3 rounded-lg">
                                <div className="grid grid-cols-5 gap-4 items-center">
                                    <span className="font-medium">{wallet.walletAddress}</span>
                                    <span className="capitalize">{wallet.walletType.toLowerCase().replace('_', ' ')}</span>
                                    <span>{wallet.linkedPhoneNumber}</span>
                                    <Badge variant={wallet.isVerified ? 'success' : 'destructive'}>
                                        {wallet.isVerified ? 'Verified' : 'Unverified'}
                                    </Badge>
                                    <div className="flex justify-end gap-2">
                                        {!wallet.isVerified && walletToVerify !== wallet.id && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setWalletToVerify(wallet.id)}
                                            >
                                                Verify
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            disabled={actionLoading === wallet.id}
                                        >
                                            {actionLoading === wallet.id ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                {!wallet.isVerified && walletToVerify === wallet.id && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <Input
                                            placeholder="Enter verification code"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleVerifyWallet}
                                            disabled={!verificationCode || actionLoading === 'verifying-wallet'}
                                        >
                                            {actionLoading === 'verifying-wallet' ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                'Submit'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Bill Payments Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Bill Payments</h2>
                <div className="flex gap-2 mb-4">
                    <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                        disabled={accounts.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={accounts.length ? "Select account" : "No accounts"} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountNumber}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => setShowPaymentDialog(true)}
                        disabled={!selectedAccountId}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Payment
                    </Button>
                </div>

                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Bill Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Biller Code"
                                value={newBillPayment.billerCode}
                                onChange={(e) => setNewBillPayment(p => ({ ...p, billerCode: e.target.value }))}
                            />
                            <Input
                                type="number"
                                placeholder="Amount"
                                min="0"
                                step="0.01"
                                value={newBillPayment.amount}
                                onChange={(e) => setNewBillPayment(p => ({ ...p, amount: Number(e.target.value) }))}
                            />
                            <Input
                                placeholder="Description"
                                value={newBillPayment.description}
                                onChange={(e) => setNewBillPayment(p => ({ ...p, description: e.target.value }))}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                                    Cancel
                                </Button>
                                <Button variant="outline" onClick={handleCreatePayment}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {billPayments.length === 0 ? (
                    <p className="text-gray-500">No payments found</p>
                ) : (
                    <ul className="space-y-3">
                        {billPayments.map((payment) => (
                            <li key={payment.id} className="border p-3 rounded-lg flex justify-between items-center">
                                <div className="grid grid-cols-4 gap-4 w-full">
                                    <span className="font-medium">{payment.receiptNumber}</span>
                                    <span>{payment.billerCode}</span>
                                    <span>${payment.amount.toFixed(2)}</span>
                                    <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeletePayment(payment.id)}
                                >
                                    Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Credit Cards Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Credit Cards</h2>
                <div className="mb-4 flex items-center gap-2">
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger>
                            <SelectValue placeholder={
                                accounts.find(a => a.id.toString() === selectedAccountId)?.accountNumber || 'Select Account'
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.accountNumber}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => setShowIssueDialog(true)}
                        disabled={!selectedAccountId || cardsLoading}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Issue Card
                    </Button>
                </div>

                {cardsLoading ? (
                    <div className="h-24 flex items-center justify-center">
                        <Loader2 className="animate-spin h-6 w-6" />
                    </div>
                ) : creditCards.length === 0 ? (
                    <p className="text-gray-500">No credit cards found</p>
                ) : (
                    <ul className="space-y-3">
                        {creditCards.map((card) => (
                            <li key={card.id} className="border p-3 rounded-lg bg-gray-50">
                                <div className="grid grid-cols-4 gap-4 items-center">
                                    <span>•••• •••• •••• {card.cardNumber.slice(-4)}</span>
                                    <span className="capitalize">{card.cardType.toLowerCase().replace('_', ' ')}</span>
                                    <span>${card.creditLimit.toFixed(2)}</span>
                                    <Badge variant={card.isActive ? 'success' : 'destructive'}>
                                        {card.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {card.isActive && (
                                    <div className="mt-2 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeactivateCard(card.id)}
                                            disabled={actionLoading === card.id}
                                        >
                                            {actionLoading === card.id ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                'Deactivate'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue New Credit Card</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Select
                                value={cardType}
                                onValueChange={(val) => setCardType(val as CardType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select card type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(CardType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Credit Limit"
                                min={MIN_CREDIT_LIMIT}
                                step="100"
                                value={creditLimit}
                                onChange={(e) => setCreditLimit(Number(e.target.value))}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleIssueCard}
                                    disabled={!cardType || creditLimit < MIN_CREDIT_LIMIT}
                                >
                                    {actionLoading === 'issuing' ? (
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    ) : null}
                                    Issue Card
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
        </div>
    );
}

// Helper Components
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}