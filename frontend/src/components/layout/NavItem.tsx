// src/components/layout/NavItem.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { IconType } from "react-icons";

interface NavItemProps {
  href: string;
  icon: IconType;
  label: string;
  exact?: boolean;
  onClick?: () => void; 
}

export default function NavItem({ href, icon: Icon, label, exact = false, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100";
  const activeClasses = "bg-blue-50 text-blue-600";

  return (
    <Link
      href={href}
      onClick={onClick} 
      className={clsx(baseClasses, {
        [activeClasses]: isActive,
      })}
    >
      <Icon size={20} />
      <span className="whitespace-nowrap font-medium">{label}</span>
    </Link>
  );
}
