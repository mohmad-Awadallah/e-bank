// utils/cn.ts
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge'; // للتعامل الذكي مع tailwind

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
