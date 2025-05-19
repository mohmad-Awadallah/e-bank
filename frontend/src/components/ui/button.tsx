// components/ui/button.tsx


import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants: Record<string, string> = {
      outline: 'border border-gray-300 text-gray-800 bg-white hover:bg-gray-100',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      success: 'bg-green-600 text-white hover:bg-green-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          className || ''
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';