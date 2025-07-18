
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, Home } from 'lucide-react';

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
}

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState<number>(50000000); // 50M RWF
  const [interestRate, setInterestRate] = useState<number>(12); // 12% typical in Rwanda
  const [loanTerm, setLoanTerm] = useState<number>(20); // 20 years
  const [downPayment, setDownPayment] = useState<number>(15000000); // 15M RWF
  const [result, setResult] = useState<MortgageResult | null>(null);

  const calculateMortgage = () => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) return;

    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly payment calculation using the formula: M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1]
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;
    const monthlyPrincipal = principal / numberOfPayments;
    const monthlyInterest = monthlyPayment - monthlyPrincipal;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      monthlyPrincipal,
      monthlyInterest
    });
  };

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm, downPayment]);

  const formatRWF = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const propertyValue = loanAmount;
  const loanToValueRatio = ((loanAmount - downPayment) / loanAmount) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-primary" />
          <CardTitle>Mortgage Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate your monthly mortgage payments and loan details for properties in Rwanda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property-value">Property Value (RWF)</Label>
              <Input
                id="property-value"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="text-lg"
              />
              <p className="text-sm text-gray-600">{formatRWF(loanAmount)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="down-payment">Down Payment (RWF)</Label>
              <Input
                id="down-payment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="text-lg"
              />
              <p className="text-sm text-gray-600">
                {formatRWF(downPayment)} ({((downPayment / loanAmount) * 100).toFixed(1)}% of property value)
              </p>
            </div>

            <div className="space-y-4">
              <Label>Interest Rate: {interestRate}%</Label>
              <Slider
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(value[0])}
                max={25}
                min={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Loan Term: {loanTerm} years</Label>
              <Slider
                value={[loanTerm]}
                onValueChange={(value) => setLoanTerm(value[0])}
                max={30}
                min={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>5 years</span>
                <span>30 years</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result && (
              <>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Monthly Payment</h3>
                  </div>
                  <p className="text-3xl font-bold text-primary">{formatRWF(result.monthlyPayment)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Loan Amount</p>
                    <p className="font-semibold">{formatRWF(loanAmount - downPayment)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">LTV Ratio</p>
                    <p className="font-semibold">{loanToValueRatio.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Principal:</span>
                    <span className="font-medium">{formatRWF(result.monthlyPrincipal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Interest:</span>
                    <span className="font-medium">{formatRWF(result.monthlyInterest)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Total Payment:</span>
                    <span className="font-semibold">{formatRWF(result.totalPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-semibold text-orange-600">{formatRWF(result.totalInterest)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Most Rwandan banks require 20-30% down payment</li>
                    <li>• Interest rates typically range from 12-18%</li>
                    <li>• Additional costs: legal fees, valuation, insurance</li>
                    <li>• Consider property taxes and maintenance costs</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageCalculator;
