// src/components/layout/Sidebar.tsx

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NavItem from "./NavItem";
import { IconType } from "react-icons"; 
import {
  FaHome,
  FaCog,
  FaExchangeAlt,
  FaWallet,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaPlusCircle,
  FaLock,
  FaListAlt,
  FaBars,
  FaTimes,
  FaReceipt,
  FaUsers,
  FaTags,
  FaBell
} from "react-icons/fa";

interface NavLink {
  href: string;
  icon: IconType; 
  label: string;
  onClick?: () => void;
}

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (!isAuthenticated) return null;

  const links: NavLink[] = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/create_account", icon: FaPlusCircle, label: "Create Account" },
    { href: "/account", icon: FaCog, label: "Account" },
    { href: "/transfer", icon: FaExchangeAlt, label: "Transfer" },
    { href: "/transactions", icon: FaListAlt, label: "Transactions" },
    { href: "/bill-payment", icon: FaFileInvoiceDollar, label: "Bill Payment" },
    { href: "/bill-payment/history", icon: FaReceipt, label: "Payment History" },
    { href: "/create-credit-cards", icon: FaPlusCircle, label: "Create Credit Card" },
    { href: "/credit-cards", icon: FaCreditCard, label: "Credit Cards" },
    { href: "/digital-wallet", icon: FaWallet, label: "Wallet" },
    { href: "/discount-coupons", icon: FaTags, label: "Discount Coupons" }, // السطر المضاف
    { href: "/security", icon: FaLock, label: "Security" },
  ];

  if (user?.role === "ROLE_ADMIN") {
    links.push(
      { href: "/admin/register-user", icon: FaPlusCircle, label: "Add User" },
      { href: "/admin/accounts", icon: FaCog, label: "Manage Accounts" },
      { href: "/admin/users", icon: FaUsers, label: "All Users" },
      { href: "/admin/create_discount-coupons", icon: FaTags, label: "Create Coupon" }, 
      { href: "/admin/create_notifications", icon: FaBell, label: "Create Notification" }
    );
  }
  

  return (
    <>
      {/* Mobile: Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for Mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
        aria-hidden={!isOpen}
      />

      <aside
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-gray-50 border-r p-4 z-50 transform transition-transform ease-in-out duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block w-64`}
      >
        <nav className="flex flex-col space-y-2">
          {links.map(({ href, icon, label }) => (
            <NavItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              onClick={isOpen ? toggleSidebar : undefined}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
