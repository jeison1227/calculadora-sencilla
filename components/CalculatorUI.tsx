
import React, { useRef, useEffect } from 'react';
import { MAIN_BUTTONS, SCIENTIFIC_BUTTONS, ACTION_BUTTONS } from '../constants';
import { CalcButton } from '../types';

interface CalculatorUIProps {
  display: string;
  subDisplay: string;
  onButtonClick: (btn: CalcButton) => void;
}

const CalculatorUI: React.FC<CalculatorUIProps> = ({ display, subDisplay, onButtonClick }) => {
  const displayEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    displayEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [display]);

  return (
    <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col gap-6">
      {/* Display Area */}
      <div className="bg-slate-950/50 rounded-2xl p-4 flex flex-col items-end justify-end h-32 overflow-hidden border border-slate-800/50 shadow-inner relative">
        <div className="absolute top-2 left-4 text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-60">
          Scientific Engine
        </div>
        <div className="text-slate-400 font-mono text-sm overflow-x-auto whitespace-nowrap w-full text-right no-scrollbar mb-1">
          {subDisplay}
        </div>
        <div className="text-white font-mono text-3xl font-bold overflow-x-auto whitespace-nowrap w-full text-right no-scrollbar">
          {display || '0'}
          <div ref={displayEndRef} />
        </div>
      </div>

      {/* Action Keys */}
      <div className="grid grid-cols-4 gap-3">
        {ACTION_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => onButtonClick(btn)}
            className={`calc-btn ${btn.color} col-span-2 py-3 rounded-xl font-bold text-lg shadow-lg`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Scientific Keys */}
      <div className="grid grid-cols-4 gap-2">
        {SCIENTIFIC_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => onButtonClick(btn)}
            className={`calc-btn ${btn.color} py-2 rounded-lg font-medium text-xs sm:text-sm text-slate-200 shadow-md`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Main Keys */}
      <div className="grid grid-cols-4 gap-3">
        {MAIN_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => onButtonClick(btn)}
            className={`calc-btn ${btn.color} ${btn.type === 'action' ? 'row-span-1' : ''} py-4 rounded-2xl font-semibold text-xl text-white shadow-lg`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorUI;
