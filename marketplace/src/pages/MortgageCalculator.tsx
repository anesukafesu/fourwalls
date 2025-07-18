
import React from 'react';
import MortgageCalculator from '@/components/Tools/MortgageCalculator';

const MortgageCalculatorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
          <p className="text-gray-600">
            Calculate your monthly mortgage payments for properties in Rwanda
          </p>
        </div>
        <MortgageCalculator />
      </div>
    </div>
  );
};

export default MortgageCalculatorPage;
