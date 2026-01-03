'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function AdminDashboard() {
  const t = useTranslations('admin');

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 md:pt-32 pb-16 flex flex-col items-center px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        {t('dashboard')}
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
        <p className="text-lg text-gray-600 mb-4">
          The custom booking system has been disabled in favor of Zoom Scheduler.
        </p>
        <p className="text-gray-500">
          Please manage appointments directly via Zoom.
        </p>
      </div>
    </div>
  );
}