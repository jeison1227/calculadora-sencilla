
export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type CalcButtonType = 'number' | 'operator' | 'function' | 'action' | 'constant';

export interface CalcButton {
  label: string;
  value: string;
  type: CalcButtonType;
  color?: string;
}

export interface ExplanationResponse {
  explanation: string;
  steps: string[];
  context: string;
}
