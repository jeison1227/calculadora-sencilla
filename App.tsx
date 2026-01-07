
import React, { useState, useEffect, useCallback } from 'react';
import CalculatorUI from './components/CalculatorUI';
import HistoryList from './components/HistoryList';
import { CalcButton, HistoryItem, ExplanationResponse } from './types';
import { explainCalculation } from './services/geminiService';

// Basic scientific math functions implementation for string evaluation
const mathUtils = {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  tan: (x: number) => Math.tan(x),
  log: (x: number) => Math.log(x),
  log10: (x: number) => Math.log10(x),
  sqrt: (x: number) => Math.sqrt(x),
  PI: Math.PI,
  E: Math.E,
};

const App: React.FC = () => {
  const [display, setDisplay] = useState<string>('');
  const [subDisplay, setSubDisplay] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<ExplanationResponse | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const evaluateExpression = (expr: string) => {
    try {
      // Replace symbols for JS evaluation
      let processed = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**')
        .replace(/PI/g, 'Math.PI')
        .replace(/E/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/log10\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(');
      
      // Factorial handling (simple regex-based approach for integers)
      processed = processed.replace(/(\d+)!/g, (match, num) => {
        let f = 1;
        for (let i = 2; i <= parseInt(num); i++) f *= i;
        return f.toString();
      });

      // Safely evaluate using Function constructor (better than eval)
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${processed}`)();
      
      if (isNaN(result) || !isFinite(result)) return 'Error';
      
      // Formatting result
      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : Number(result.toFixed(8)).toString();
        
      return formattedResult;
    } catch (err) {
      console.error("Evaluation Error", err);
      return 'Error';
    }
  };

  const handleButtonClick = (btn: CalcButton) => {
    if (btn.value === 'AC') {
      setDisplay('');
      setSubDisplay('');
      setAiExplanation(null);
      return;
    }

    if (btn.value === 'DEL') {
      setDisplay(prev => prev.slice(0, -1));
      return;
    }

    if (btn.value === '=') {
      if (!display) return;
      
      const result = evaluateExpression(display);
      setSubDisplay(display + ' =');
      
      if (result !== 'Error') {
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          expression: display,
          result: result,
          timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev]);
        setDisplay(result);
      } else {
        setDisplay('Error');
      }
      return;
    }

    // Append to display
    setDisplay(prev => {
      // Prevent multiple dots in one number
      if (btn.value === '.' && prev.split(/[-+*/^()]/).pop()?.includes('.')) {
        return prev;
      }
      return prev + btn.value;
    });
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setDisplay(item.expression);
    setSubDisplay(item.expression + ' = ' + item.result);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  const getAiExplanation = async () => {
    if (!history[0] || isExplaining) return;
    
    setIsExplaining(true);
    setAiExplanation(null);
    
    const latest = history[0];
    try {
      const explanation = await explainCalculation(latest.expression, latest.result);
      setAiExplanation(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 mb-2">
          Gemini Scientific
        </h1>
        <p className="text-slate-400 text-sm">Elegant mathematics powered by AI</p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: History */}
        <div className="lg:col-span-3 order-2 lg:order-1 glass-panel rounded-3xl p-6 h-[500px] lg:h-[650px] shadow-xl">
          <HistoryList 
            history={history} 
            onItemClick={handleHistoryItemClick} 
            onClear={clearHistory}
          />
        </div>

        {/* Center: Calculator UI */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <CalculatorUI 
            display={display} 
            subDisplay={subDisplay} 
            onButtonClick={handleButtonClick} 
          />
        </div>

        {/* Right Side: AI Explainer */}
        <div className="lg:col-span-4 order-3 glass-panel rounded-3xl p-6 h-[650px] flex flex-col shadow-xl border-indigo-500/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-indigo-300 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              AI Explainer
            </h3>
            <button 
              onClick={getAiExplanation}
              disabled={history.length === 0 || isExplaining}
              className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-2
                ${history.length === 0 || isExplaining 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
            >
              {isExplaining ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <i className="fa-solid fa-brain"></i>
              )}
              {isExplaining ? 'Thinking...' : 'Explain Last'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {!aiExplanation && !isExplaining && (
              <div className="text-center py-20 opacity-30 px-8">
                <i className="fa-solid fa-microchip text-5xl mb-4"></i>
                <p className="text-sm">Run a calculation and click "Explain Last" to get step-by-step insights from Gemini.</p>
              </div>
            )}

            {isExplaining && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-24 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-32 bg-slate-800 rounded"></div>
              </div>
            )}

            {aiExplanation && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-tight">Overview</h4>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                    {aiExplanation.explanation}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-2 uppercase tracking-tight">Step by Step</h4>
                  <div className="space-y-2">
                    {aiExplanation.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {idx + 1}
                        </span>
                        <p className="mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-tight">Concept</h4>
                  <p className="text-xs text-slate-400 italic bg-amber-900/10 p-3 rounded-xl border border-amber-900/20">
                    {aiExplanation.context}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 text-slate-500 text-xs flex gap-6">
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-code"></i> TypeScript & React
        </span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-bolt"></i> Netlify Compatible
        </span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-brain"></i> Gemini 1.5 Flash
        </span>
      </footer>
    </div>
  );
};

export default App;
