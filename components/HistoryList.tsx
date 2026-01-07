
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onItemClick: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onItemClick, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 italic py-8">
        <i className="fa-solid fa-clock-rotate-left text-3xl mb-2 opacity-20"></i>
        <p>No history yet</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-semibold text-slate-300">History</h3>
        <button 
          onClick={onClear}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="w-full text-left p-3 mb-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all group"
          >
            <div className="text-xs text-slate-400 mb-1 flex justify-between">
              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <i className="fa-solid fa-arrow-right-to-bracket opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
            <div className="font-mono text-sm text-indigo-300 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.expression}
            </div>
            <div className="font-mono font-bold text-slate-100 mt-1">
              = {item.result}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
