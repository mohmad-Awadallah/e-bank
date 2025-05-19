// src/app/page.tsx

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import useSWR from 'swr';
import {
  FaExchangeAlt, // استبدال FaMoneyBillTransfer بـ FaExchangeAlt
  FaCreditCard,
  FaUser,
  FaHeadset,
} from 'react-icons/fa';
import { SiGoogleplay, SiAppstore } from 'react-icons/si';
import { GiMoneyStack } from 'react-icons/gi';


const ExchangeRates = () => {
  const fetcher = (url: string) => axios.get(url).then(res => res.data);
  const { data, error } = useSWR(
    'https://api.exchangerate-api.com/v4/latest/USD',
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: false }
  );

  const currencies = ['EUR', 'GBP', 'JPY', 'AED', 'SAR'];

  if (error) return <div className="text-center text-red-500">Failed to load rates</div>;
  if (!data) return <div className="text-center">Loading rates...</div>;

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currencies.map(currency => (
        <motion.div
          key={currency}
          className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{currency}</span>
            <span className="text-blue-600">
              {data.rates[currency]?.toFixed(2) || 'N/A'}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            1 USD = {currency}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const targetRoute = user?.role === 'ROLE_ADMIN'
        ? '/admin/dashboard'
        : '/dashboard';
      router.replace(targetRoute);
    }
  }, [isAuthenticated, router, user?.role]);

  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      title: 'Instant Transfers',
      description: 'Send and receive money in seconds',
      icon: <FaExchangeAlt className="text-blue-600 text-4xl mb-4" />, // تم استبدال الأيقونة هنا
    },
    {
      title: 'Secure Payments',
      description: 'Pay bills securely and easily',
      icon: <FaCreditCard className="text-blue-600 text-4xl mb-4" />,
    },
    {
      title: 'Account Management',
      description: 'Track your financial transactions easily',
      icon: <FaUser className="text-blue-600 text-4xl mb-4" />,
    },
    {
      title: '24/7 Support',
      description: 'Customer service available around the clock',
      icon: <FaHeadset className="text-blue-600 text-4xl mb-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* Main Section */}
      <motion.section
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              The Leading Digital Bank <br />
              <span className="text-blue-600">to Manage Your Money Smartly</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Innovative banking solutions that give you complete control over
              your funds anytime, anywhere.
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium transition-colors"
              >
                Start Now for Free
              </Link>
            </div>
          </div>

          <motion.div
            className="lg:w-1/2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-full h-80 bg-blue-100 rounded-lg flex items-center justify-center">
              <img
                src="illustration.png"
                alt="Online Banking Illustration"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

          </motion.div>
        </div>
      </motion.section>

      {/* Exchange Rates */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
            <GiMoneyStack className="text-blue-600" />
            Live Exchange Rates
          </h2>
          <ExchangeRates />
        </div>
      </section>

      {/* Bank Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose E-Bank?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ y: -5 }}
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-blue-600 rounded-3xl p-12">
          <div className="lg:w-1/2 text-white">
            <h2 className="text-3xl font-bold mb-6">Download Our App Now</h2>
            <p className="text-lg mb-8">
              Managing your finances is easier with the E-Bank mobile app for
              smartphones.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100">
                <SiGoogleplay className="text-xl" />
                Google Play
              </button>
              <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100">
                <SiAppstore className="text-xl" />
                App Store
              </button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="w-full h-80 bg-blue-100 rounded-lg flex items-center justify-center">
              <img
                src="/Mobile App Preview.png"
                alt="Online Banking Illustration"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

          </div>
        </div>
      </motion.section>
    </div>
  );
}
