import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'yellow';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    blue: 'border-neural-blue border-t-transparent',
    purple: 'border-neural-purple border-t-transparent',
    green: 'border-neural-green border-t-transparent',
    yellow: 'border-neural-yellow border-t-transparent',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-sm text-text-secondary">{text}</p>}
    </div>
  );
};

// A skeleton loader for content loading
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-bg-elevated/50 ${className}`} />
);

// Training-specific loader with progress
export const TrainingLoader: React.FC<{
  epoch: number;
  total: number;
  loss: number;
  accuracy: number;
}> = ({ epoch, total, loss, accuracy }) => {
  const progress = Math.min((epoch / total) * 100, 100);

  return (
    <div className="space-y-4 rounded-xl border border-border-subtle bg-bg-elevated/60 p-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-neural-green border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="text-left">
          <h3 className="text-lg font-bold text-neural-green">Training in progress</h3>
          <p className="text-sm text-text-dim">Epoch {epoch} / {total}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
        <motion.div
          className="h-full bg-gradient-to-r from-neural-blue to-neural-green"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-text-dim">Loss</p>
          <p className="font-mono text-neural-red">{loss.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-text-dim">Accuracy</p>
          <p className="font-mono text-neural-green">{(accuracy * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
