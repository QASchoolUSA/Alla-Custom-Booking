import React, { Suspense } from 'react';
import SuccessContentClient from './SuccessContentClient'

// Server component wrapper
function SuccessContent({ locale }: { locale: string }) {
  return <SuccessContentClient locale={locale} />;
}

// Main page component with Suspense boundary
export default async function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="success-page-loading">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg" data-testid="success-page-loading-container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" data-testid="page-loading-spinner"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900" data-testid="page-loading-message">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <SuccessContent locale={resolvedParams.locale} />
    </Suspense>
  );
}