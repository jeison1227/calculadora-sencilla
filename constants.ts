
import { CalcButton } from './types';

export const SCIENTIFIC_BUTTONS: CalcButton[] = [
  { label: 'sin', value: 'sin(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'cos', value: 'cos(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'tan', value: 'tan(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'log', value: 'log10(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'ln', value: 'log(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'π', value: 'PI', type: 'constant', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: 'e', value: 'E', type: 'constant', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: '^', value: '^', type: 'operator', color: 'bg-indigo-600 hover:bg-indigo-500' },
  { label: '√', value: 'sqrt(', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
  { label: '(', value: '(', type: 'operator', color: 'bg-slate-600 hover:bg-slate-500' },
  { label: ')', value: ')', type: 'operator', color: 'bg-slate-600 hover:bg-slate-500' },
  { label: '!', value: '!', type: 'function', color: 'bg-slate-700 hover:bg-slate-600' },
];

export const MAIN_BUTTONS: CalcButton[] = [
  { label: '7', value: '7', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '8', value: '8', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '9', value: '9', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '÷', value: '/', type: 'operator', color: 'bg-indigo-600 hover:bg-indigo-500' },
  
  { label: '4', value: '4', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '5', value: '5', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '6', value: '6', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '×', value: '*', type: 'operator', color: 'bg-indigo-600 hover:bg-indigo-500' },
  
  { label: '1', value: '1', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '2', value: '2', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '3', value: '3', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '−', value: '-', type: 'operator', color: 'bg-indigo-600 hover:bg-indigo-500' },
  
  { label: '0', value: '0', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '.', value: '.', type: 'number', color: 'bg-slate-800 hover:bg-slate-700' },
  { label: '=', value: '=', type: 'action', color: 'bg-emerald-600 hover:bg-emerald-500' },
  { label: '+', value: '+', type: 'operator', color: 'bg-indigo-600 hover:bg-indigo-500' },
];

export const ACTION_BUTTONS: CalcButton[] = [
  { label: 'AC', value: 'AC', type: 'action', color: 'bg-rose-700 hover:bg-rose-600' },
  { label: 'DEL', value: 'DEL', type: 'action', color: 'bg-slate-600 hover:bg-slate-500' },
];
