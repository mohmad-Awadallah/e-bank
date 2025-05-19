import apiClient from '@/lib/apiClient';

export type DiscountCoupon = {
    id: number;
    couponCode: string;
    description: string;
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE';
    discountValue: number;
    expiryDate: string;
    usageLimit: number;
};

export const fetchCoupons = async (): Promise<DiscountCoupon[]> => {
    const response = await apiClient.get("coupons/active");
    return response.data;
};


// جلب الكوبون عبر الكود
export const getCouponByCode = async (couponCode: string): Promise<DiscountCoupon> => {
    const response = await apiClient.get(`/api/coupons/${couponCode}`);
    return response.data;
};

export interface CreateCouponParams {
    couponCode: string;
    description: string;
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE';
    discountValue: number;
    expiryDate: string;
    usageLimit: number;
}

export const createCoupon = async ({
    couponCode,
    description,
    discountType,
    discountValue,
    expiryDate,
    usageLimit,
}: CreateCouponParams): Promise<DiscountCoupon> => {
    try {
        const response = await apiClient.post(
            '/coupons',
            null,
            {
                params: {
                    couponCode,
                    description,
                    discountType,
                    discountValue,
                    expiryDate,
                    usageLimit,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating coupon:', error);
        throw new Error('Failed to create coupon');
    }
};

// تفعيل الكوبون (استخدامه)
export const applyCoupon = async (couponCode: string): Promise<DiscountCoupon> => {
    const response = await apiClient.post(`/coupons/${couponCode}/apply`);
    console.log(response.data);
    return response.data;
};

// تعطيل الكوبون
export const deactivateCoupon = async (couponCode: string): Promise<void> => {
    await apiClient.delete(`/coupons/${couponCode}`);
};

// التحقق من صلاحية الكوبون
export const checkCouponValidity = async (couponCode: string): Promise<boolean> => {
    const response = await apiClient.get(`/coupons/${couponCode}/validity`);
    return response.data;
};

// تعديل حد الاستخدام
export const updateUsageLimit = async (couponCode: string, newLimit: number): Promise<DiscountCoupon> => {
    const response = await apiClient.patch(`/coupons/${couponCode}/usage-limit`, null, {
        params: { newLimit },
    });
    return response.data;
};

// جلب الكوبونات حسب النوع
export const getCouponsByType = async (
    discountType: "PERCENTAGE" | "FIXED"
): Promise<DiscountCoupon[]> => {
    const response = await apiClient.get(`/coupons/type/${discountType}`);
    return response.data;
};