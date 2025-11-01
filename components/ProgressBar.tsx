
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && <div className="text-sm text-slate-400 mb-1 flex justify-between">
        <span>{label}</span>
        <span>{value} / {max}</span>
        </div>}
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
