"use client";

import { useState, useMemo } from "react";

export default function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(20);
  const [years, setYears] = useState(25);
  const [interestRate, setInterestRate] = useState(7.5);

  const calculation = useMemo(() => {
    const loanAmount = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
      return {
        monthlyPayment: loanAmount / numPayments,
        totalPayment: loanAmount,
        totalInterest: 0,
        loanAmount,
      };
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
    };
  }, [propertyPrice, downPayment, years, interestRate]);

  const formatPLN = (value: number) =>
    Math.round(value).toLocaleString("pl-PL") + " zł";

  const loanPercent = ((calculation.loanAmount / calculation.totalPayment) * 100).toFixed(0);

  return (
    <section id="kalkulator" className="py-20 bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Kalkulator <span className="gradient-text">kredytowy</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sprawdź orientacyjną ratę kredytu hipotecznego. Oblicz ile będziesz płacić miesięcznie.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Sliders */}
          <div className="space-y-8">
            {/* Property price */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Wartość nieruchomości</label>
                <span className="font-bold text-accent">{formatPLN(propertyPrice)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={3000000}
                step={10000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>100 000 zł</span>
                <span>3 000 000 zł</span>
              </div>
            </div>

            {/* Down payment */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Wkład własny</label>
                <span className="font-bold text-accent">{downPayment}% ({formatPLN(propertyPrice * downPayment / 100)})</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>10%</span>
                <span>90%</span>
              </div>
            </div>

            {/* Years */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Okres kredytu</label>
                <span className="font-bold text-accent">{years} lat</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>5 lat</span>
                <span>35 lat</span>
              </div>
            </div>

            {/* Interest rate */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Oprocentowanie</label>
                <span className="font-bold text-accent">{interestRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>2%</span>
                <span>15%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            {/* Monthly payment - big */}
            <div className="text-center mb-8">
              <div className="text-sm text-white/60 mb-1">Twoja miesięczna rata</div>
              <div className="text-5xl font-bold gradient-text">
                {formatPLN(calculation.monthlyPayment)}
              </div>
            </div>

            {/* Visual breakdown */}
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-6">
              <div
                className="absolute left-0 top-0 bottom-0 bg-accent rounded-full transition-all duration-500"
                style={{ width: `${loanPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mb-8">
              <span>Kapitał ({loanPercent}%)</span>
              <span>Odsetki ({100 - Number(loanPercent)}%)</span>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Kwota kredytu</span>
                <span className="font-bold">{formatPLN(calculation.loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Suma odsetek</span>
                <span className="font-bold text-red-300">{formatPLN(calculation.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Całkowity koszt</span>
                <span className="font-bold">{formatPLN(calculation.totalPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/70">Wkład własny</span>
                <span className="font-bold text-green-300">{formatPLN(propertyPrice * downPayment / 100)}</span>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-6 text-center">
              * Kalkulacja ma charakter orientacyjny i nie stanowi oferty kredytowej
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
