// src/app/(dashboard)/discount-coupons/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { fetchCoupons, DiscountCoupon } from '@/services/discount-coupon';
import { BadgePercent, Calendar, Coins, Info, Maximize2 } from 'lucide-react';

export default function DiscountCouponsPage() {
    const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupons()
            .then((data) => setCoupons(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="p-4">Loading coupons...</p>;

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BadgePercent className="w-6 h-6 text-primary" />
                Discount Coupons
            </h1>

            {coupons.length === 0 ? (
                <p>No coupons available at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.couponCode}
                            className="p-4 border border-gray-200 rounded-xl shadow-sm space-y-2 hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BadgePercent className="w-5 h-5 text-green-600" />
                                {coupon.couponCode}
                            </h2>

                            <p className="flex items-center gap-2 text-sm text-gray-700">
                                <Info className="w-4 h-4 text-gray-500" />
                                {coupon.description}
                            </p>

                            <p className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <strong>Type:</strong>{' '}
                                {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                            </p>

                            <p className="flex items-center gap-2">
                                <BadgePercent className="w-4 h-4 text-blue-500" />
                                <strong>Value:</strong> {coupon.discountValue}
                            </p>

                            <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <strong>Expires:</strong> {coupon.expiryDate}
                            </p>

                            <p className="flex items-center gap-2">
                                <Maximize2 className="w-4 h-4 text-red-500" />
                                <strong>Usage Limit:</strong> {coupon.usageLimit}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
