// app/admin/create_discount-coupons/page.tsx


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
    createCoupon,
    fetchCoupons,
    DiscountCoupon,
    deactivateCoupon,
    checkCouponValidity,
    updateUsageLimit
} from '@/services/discount-coupon';

const DISCOUNT_TYPES = [
    { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'FREE_SHIPPING', label: 'Free Shipping' },
    { value: 'BUY_ONE_GET_ONE', label: 'Buy One Get One' }
] as const;

type DiscountType = typeof DISCOUNT_TYPES[number]['value'];

export default function CreateDiscountCouponPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        couponCode: '',
        description: '',
        discountType: undefined as DiscountType | undefined,
        discountValue: '',
        expiryDate: '',
        usageLimit: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);

    useEffect(() => {
        fetchCoupons()
            .then((data) => setCoupons(data))
            .catch(() => toast.error('Failed to load existing coupons'));
    }, []);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((e) => ({ ...e, [field]: '' }));
    };

    const validateForm = (): boolean => {
        const { couponCode, description, discountType, discountValue, expiryDate, usageLimit } = form;
        const newErrors: Partial<Record<keyof typeof form, string>> = {};

        if (!couponCode.trim()) newErrors.couponCode = 'Coupon code is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!discountType) newErrors.discountType = 'Discount type is required';
        if (!discountValue.trim()) newErrors.discountValue = 'Discount value is required';
        if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
        if (!usageLimit.trim()) newErrors.usageLimit = 'Usage limit is required';

        const discountVal = Number(discountValue);
        if (discountValue && (isNaN(discountVal) || discountVal <= 0)) {
            newErrors.discountValue = 'Must be greater than 0';
        }
        if (discountType === 'PERCENTAGE' && (discountVal < 1 || discountVal > 100)) {
            newErrors.discountValue = 'Must be between 1 and 100%';
        }

        const usageLim = Number(usageLimit);
        if (usageLimit && (isNaN(usageLim) || usageLim < 1)) {
            newErrors.usageLimit = 'Must be at least 1';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix form errors');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const created = await createCoupon({
                couponCode: form.couponCode.toUpperCase(),
                description: form.description,
                discountType: form.discountType!,
                discountValue: Number(form.discountValue),
                expiryDate: form.expiryDate,
                usageLimit: Number(form.usageLimit)
            });

            toast.success(`Coupon "${created.couponCode}" created!`);
            setCoupons((prev) => [created, ...prev]);
            setForm({ couponCode: '', description: '', discountType: undefined, discountValue: '', expiryDate: '', usageLimit: '' });
            setErrors({});
        } catch (error: any) {
            let errorMessage = 'Failed to create coupon';
            if (error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                const fieldErrors: Partial<Record<keyof typeof form, string>> = {};
                Object.entries(serverErrors).forEach(([field, messages]: [string, any]) => {
                    const key = field as keyof typeof form;
                    fieldErrors[key] = (messages as string[]).join(', ');
                });
                setErrors(fieldErrors);
                errorMessage = 'Invalid form data';
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // وظائف تعطيل الكوبون والتحقق من الصلاحية
    const handleDeactivateCoupon = async (couponCode: string) => {
        try {
            await deactivateCoupon(couponCode);
            setCoupons((prev) => prev.filter((coupon) => coupon.couponCode !== couponCode));
            toast.success(`Coupon ${couponCode} deactivated!`);
        } catch (error) {
            toast.error('Failed to deactivate coupon');
        }
    };

    const handleCheckCouponValidity = async (couponCode: string) => {
        try {
            const isValid = await checkCouponValidity(couponCode);
            toast.success(isValid ? 'Coupon is valid!' : 'Coupon is not valid');
        } catch (error) {
            toast.error('Failed to check coupon validity');
        }
    };

    const handleUpdateUsageLimit = async (couponCode: string, newLimit: number) => {
        try {
            const updatedCoupon = await updateUsageLimit(couponCode, newLimit);
            setCoupons((prev) => prev.map((coupon) => coupon.couponCode === couponCode ? updatedCoupon : coupon));
            toast.success(`Updated usage limit for ${couponCode}`);
        } catch (error) {
            toast.error('Failed to update usage limit');
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12 p-6 space-y-8 border rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold">Create Discount Coupon</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Coupon Code</Label>
                    <Input
                        placeholder="e.g. SAVE10"
                        value={form.couponCode}
                        onChange={(e) => handleChange('couponCode', e.target.value)}
                    />
                    {errors.couponCode && <p className="text-red-500 text-sm">{errors.couponCode}</p>}
                </div>
                <div>
                    <Label>Description</Label>
                    <Input
                        placeholder="Short description"
                        value={form.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div>
                    <Label>Discount Type</Label>
                    <Select value={form.discountType} onValueChange={(val) => handleChange('discountType', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type…" />
                        </SelectTrigger>
                        <SelectContent>
                            {DISCOUNT_TYPES.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.discountType && <p className="text-red-500 text-sm">{errors.discountType}</p>}
                </div>
                <div>
                    <Label>{form.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Value'}</Label>
                    <Input
                        type="number"
                        placeholder={form.discountType === 'PERCENTAGE' ? '1–100' : 'Numeric value'}
                        value={form.discountValue}
                        onChange={(e) => handleChange('discountValue', e.target.value)}
                    />
                    {errors.discountValue && <p className="text-red-500 text-sm">{errors.discountValue}</p>}
                </div>
                <div>
                    <Label>Expiry Date</Label>
                    <Input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => handleChange('expiryDate', e.target.value)}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
                </div>
                <div>
                    <Label>Usage Limit</Label>
                    <Input
                        type="number"
                        min="1"
                        placeholder="How many uses?"
                        value={form.usageLimit}
                        onChange={(e) => handleChange('usageLimit', e.target.value)}
                    />
                    {errors.usageLimit && <p className="text-red-500 text-sm">{errors.usageLimit}</p>}
                </div>
            </div>

            <Button 
                variant="outline" 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full md:w-auto"
            >
                {loading ? (
                    <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Creating...
                    </span>
                ) : 'Create Coupon'}
            </Button>

            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Existing Coupons</h2>
                {coupons.length === 0 ? (
                    <p className="text-gray-500">No coupons found.</p>
                ) : (
                    <ul className="space-y-3">
                        {coupons.map((c) => (
                            <li 
                                key={`coupon-${c.id}-${c.couponCode}`} 
                                className="p-4 border rounded flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium">{c.couponCode}</p>
                                    <p className="text-sm text-gray-600">{c.description}</p>
                                </div>
                                <div className="text-right">
                                    <p>{c.discountType.replace(/_/g, ' ')}: {c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : ''}</p>
                                    <p className="text-sm text-gray-500">Expires {new Date(c.expiryDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">Limit: {c.usageLimit}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Button variant="outline" onClick={() => handleCheckCouponValidity(c.couponCode)} size="sm">Check Validity</Button>
                                        <Button variant="outline" onClick={() => handleUpdateUsageLimit(c.couponCode, c.usageLimit + 1)} size="sm">Increase Limit</Button>
                                        <Button onClick={() => handleDeactivateCoupon(c.couponCode)} size="sm" variant="destructive">Deactivate</Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}