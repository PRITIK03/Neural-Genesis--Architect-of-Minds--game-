import { motion } from 'framer-motion';
import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  color?: string;
  formatValue?: (v: number) => string;
  showRangeLabels?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color = 'neural-blue',
  formatValue,
  showRangeLabels = true,
}) => (
  <div>
    <label className="mb-1.5 flex justify-between text-xs font-semibold text-text-secondary">
      <span>{label}</span>
      <span className={`font-mono text-${color}`}>{formatValue ? formatValue(value) : value}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`h-2 w-full cursor-pointer accent-${color}`}
    />
    {showRangeLabels && (
      <div className="mt-1 flex justify-between text-xs text-text-dim">
        <span>{min}</span>
        <span className="font-mono">{value}</span>
        <span>{max}</span>
      </div>
    )}
  </div>
);

interface OptionButtonProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  color?: string;
  formatLabel?: (v: T) => string;
  className?: string;
}

export const OptionButtons = <T extends string>({
  options,
  value,
  onChange,
  color = 'neural-blue',
  formatLabel = (v) => v.toUpperCase(),
  className = 'grid grid-cols-2 gap-2',
}: OptionButtonProps<T>) => (
  <div className={className}>
    {options.map((opt) => (
      <motion.button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          value === opt
            ? `border-${color} bg-${color}/20 text-${color}`
            : `border-border-subtle bg-bg-elevated text-text-secondary hover:border-${color}/40`
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {formatLabel(opt)}
      </motion.button>
    ))}
  </div>
);