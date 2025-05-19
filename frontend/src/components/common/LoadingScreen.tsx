// src/components/common/LoadingScreen.tsx
'use client';
import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg font-semibold text-gray-800">Loading...</div>
    </div>
  );
}