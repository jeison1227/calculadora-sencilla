
import React, { useState, useEffect } from 'react';
import CalculatorUI from './components/CalculatorUI';
import HistoryList from './components/HistoryList';
import { CalcButton, HistoryItem, ExplanationResponse } from './types';
import { explainCalculation } from './services/geminiService';

const App: React.FC = () => {
  const [display, setDisplay] = useState<string>('');
  const [subDisplay, setSubDisplay] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<ExplanationResponse | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  const evaluateExpression = (expr: string) => {
    try {
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
      
      processed = processed.replace(/(\d+)!/g, (match, num) => {
        let f = 1;
        for (let i = 2; i <= parseInt(num); i++) f *= i;
        return f.toString();
      });

      const result = new Function(`return ${processed}`)();
      if (isNaN(result) || !isFinite(result)) return 'Error';
      return Number.isInteger(result) ? result.toString() : Number(result.toFixed(8)).toString();
    } catch (err) {
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
    setDisplay(prev => {
      if (btn.value === '.' && prev.split(/[-+*/^()]/).pop()?.includes('.')) return prev;
      return prev + btn.value;
    });
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setDisplay(item.expression);
    setSubDisplay(item.expression + ' = ' + item.result);
  };

  const getAiExplanation = async () => {
    if (!history[0] || isExplaining) return;
    setIsExplaining(true);
    setAiExplanation(null);
    try {
      const explanation = await explainCalculation(history[0].expression, history[0].result);
      setAiExplanation(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <header className="mb-8 text-center relative w-full max-w-6xl">
        <div className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          NETLIFY READY
        </div>
        
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-300 to-indigo-600 mb-2 tracking-tighter">
          Gemini Scientific
        </h1>
        <p className="text-slate-400 text-sm font-medium">Calculadora Inteligente Optimizada para la Nube</p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        <div className="lg:col-span-3 order-2 lg:order-1 glass-panel rounded-3xl p-6 h-[500px] lg:h-[680px] shadow-2xl flex flex-col">
          <HistoryList 
            history={history} 
            onItemClick={handleHistoryItemClick} 
            onClear={() => setHistory([])}
          />
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center gap-4">
          <CalculatorUI 
            display={display} 
            subDisplay={subDisplay} 
            onButtonClick={handleButtonClick} 
          />
          <div className="w-full max-w-md bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <i className="fa-solid fa-cloud-arrow-up text-indigo-400"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-white">¿Listo para publicar?</p>
                <p className="text-[10px] text-slate-400">Despliegue rápido en Netlify</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDeployModal(true)}
              className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              GUÍA DE DESPLIEGUE
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 order-3 glass-panel rounded-3xl p-6 h-[680px] flex flex-col shadow-2xl border-indigo-500/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-indigo-300 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              AI Explainer
            </h3>
            <button 
              onClick={getAiExplanation}
              disabled={history.length === 0 || isExplaining}
              className={`text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold
                ${history.length === 0 || isExplaining 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:scale-95'}`}
            >
              {isExplaining ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-brain"></i>}
              {isExplaining ? 'ANALIZANDO...' : 'EXPLICAR ÚLTIMO'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
            {!aiExplanation && !isExplaining && (
              <div className="text-center py-24 opacity-40 px-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                  <i className="fa-solid fa-bolt-lightning text-3xl text-indigo-400"></i>
                </div>
                <h4 className="text-white font-bold mb-2">Sin análisis activo</h4>
                <p className="text-xs text-slate-400">Realiza un cálculo y presiona "Explicar Último" para que la IA desglose el resultado.</p>
              </div>
            )}

            {isExplaining && (
              <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-slate-800/50 rounded-2xl"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800/50 rounded w-full"></div>
                  <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800/50 rounded w-4/6"></div>
                </div>
                <div className="h-24 bg-slate-800/50 rounded-2xl"></div>
              </div>
            )}

            {aiExplanation && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-emerald-400 mb-3 uppercase tracking-[0.2em]">Resumen Teórico</h4>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    {aiExplanation.explanation}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-[0.2em]">Paso a Paso</h4>
                  <div className="space-y-3">
                    {aiExplanation.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 text-sm text-slate-300 group">
                        <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                          {idx + 1}
                        </span>
                        <p className="mt-1 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-5 rounded-3xl border border-indigo-500/10">
                  <h4 className="text-[10px] font-black text-amber-400 mb-2 uppercase tracking-[0.2em]">Contexto Matemático</h4>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{aiExplanation.context}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Despliegue */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#25c2bd] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-[#25c2bd]/20">
                  <i className="fa-solid fa-cloud"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">Publicar en Netlify</h2>
                  <p className="text-slate-400 text-sm">Sigue estos pasos para tener tu app online en 2 minutos.</p>
                </div>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-500 hover:text-white transition-colors text-xl p-2">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="space-y-6">
              {[
                { 
                  step: 1, 
                  title: "Sube tu código a GitHub", 
                  desc: "Crea un nuevo repositorio y sube todos los archivos actuales de este proyecto." 
                },
                { 
                  step: 2, 
                  title: "Conecta con Netlify", 
                  desc: "En tu panel de Netlify, selecciona 'Add new site' > 'Import an existing project' y elige tu repo de GitHub." 
                },
                { 
                  step: 3, 
                  title: "Configura la API Key", 
                  desc: "¡Importante! Ve a 'Site settings' > 'Environment variables' y añade una variable llamada 'API_KEY' con tu clave de Gemini API." 
                },
                { 
                  step: 4, 
                  title: "Ajustes de Build", 
                  desc: "Asegúrate de que 'Publish directory' sea '.' (un punto) ya que esta app usa ESM directo." 
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                onClick={() => setShowDeployModal(false)}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
              >
                ENTENDIDO
              </button>
              <a 
                href="https://app.netlify.com/start" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-[#25c2bd] hover:bg-[#1fa9a5] text-slate-900 font-black rounded-2xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-[#25c2bd]/20"
              >
                IR A NETLIFY <i className="fa-solid fa-external-link text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 mb-8 text-slate-500 text-[10px] font-bold tracking-widest flex flex-wrap justify-center gap-8 uppercase">
        <span className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-default">
          <i className="fa-solid fa-shield-halved"></i> Enterprise Security
        </span>
        <span className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-default">
          <i className="fa-solid fa-server"></i> Netlify Edge Optimized
        </span>
        <span className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-default">
          <i className="fa-solid fa-microchip"></i> Gemini Engine 3.0
        </span>
      </footer>
    </div>
  );
};

export default App;
