// src/components/layout/Header.tsx

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaPlusCircle,
  FaHome,
} from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";

interface HeaderProps {
  showBackButton?: boolean;
  additionalLinks?: React.ReactNode;
}

// Memoized notification menu for performance
const NotificationMenu = memo(({ notifications, hasUnread, onMarkRead }: any) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle menu visibility
  const toggleMenu = useCallback(() => setOpen((prev) => !prev), []);

  // Handle outside clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <FiBell size={24} />
        {hasUnread && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="notifications-menu"
            role="menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg p-4 z-50"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {hasUnread && (
                <button
                  onClick={() => notifications.forEach((n: any) => onMarkRead(n.id))}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((n: any) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClick={() => onMarkRead(n.id)}
                  />
                ))}
              </ul>
            )}

            <div className="mt-2 text-center">
              <Link href="/notifications" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const Header = ({ showBackButton = false, additionalLinks }: HeaderProps) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { notifications, hasUnread, markAsRead } = useNotifications(user?.id);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  }, [logout]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link
          href={
            isAuthenticated
              ? user?.role === "ROLE_ADMIN"
                ? "/admin/dashboard"
                : "/dashboard"
              : "/"
          }
          aria-label="E-Bank Home"
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
            <FaHome />
          </div>
          <span className="text-2xl font-bold text-blue-600 hidden sm:block">E-Bank</span>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center flex-wrap gap-4 w-full md:w-auto justify-center md:justify-end">
          {showBackButton && (
            <Link
              href="/"
              className="flex items-center gap-1 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50"
            >
              <FaArrowLeft /> Back
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <NotificationMenu
                notifications={notifications}
                hasUnread={hasUnread}
                onMarkRead={markAsRead}
              />

              <Link
                href="/profile"
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-blue-600 hover:bg-blue-50"
                data-testid="profile-btn"
              >
                <FaUser /> {user?.firstName} {user?.lastName}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 border border-red-600 px-4 py-2 rounded-full hover:bg-red-50"
                data-testid="logout-btn"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </>
          ) : (
            additionalLinks || (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-full"
                >
                  <FaSignInAlt /> Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                >
                  <FaPlusCircle /> Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
